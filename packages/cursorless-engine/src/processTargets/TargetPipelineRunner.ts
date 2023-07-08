import { ImplicitTargetDescriptor, Modifier, Range } from "@cursorless/common";
import { uniqWith, zip } from "lodash";
import {
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  TargetDescriptor,
} from "../typings/TargetDescriptor";
import { Target } from "../typings/target.types";
import { MarkStageFactory } from "./MarkStageFactory";
import { ModifierStageFactory } from "./ModifierStageFactory";
import { MarkStage, ModifierStage } from "./PipelineStages.types";
import ImplicitStage from "./marks/ImplicitStage";
import { ContainingTokenIfUntypedEmptyStage } from "./modifiers/ConditionalModifierStages";
import { PlainTarget, PositionTarget } from "./targets";

export class TargetPipelineRunner {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private markStageFactory: MarkStageFactory,
  ) {}

  /**
   * Converts the abstract target descriptions provided by the user to a
   * concrete representation usable by actions. Conceptually, the input will be
   * something like "the function call argument containing the cursor" and the
   * output will be something like "line 3, characters 5 through 10".
   * @param targets The abstract target representations provided by the user
   * @param actionPrePositionStages Modifier stages contributed by the action
   * @param actionFinalStages Modifier stages contributed by the action that
   * should run at the end of the modifier pipeline
   * @returns A list of lists of typed selections, one list per input target.
   * Each typed selection includes the selection, as well the uri of the
   * document containing it, and potentially rich context information such as
   * how to remove the target
   */
  run(
    target: TargetDescriptor,
    actionPrePositionStages?: ModifierStage[],
    actionFinalStages?: ModifierStage[],
  ): Target[] {
    return new TargetPipeline(
      this.modifierStageFactory,
      this.markStageFactory,
      target,
      actionPrePositionStages ?? [],
      actionFinalStages ?? [],
    ).run();
  }
}

class TargetPipeline {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private markStageFactory: MarkStageFactory,
    private target: TargetDescriptor,
    private actionPrePositionStages: ModifierStage[],
    private actionFinalStages: ModifierStage[],
  ) {}

  /**
   * Converts the abstract target descriptions provided by the user to a concrete
   * representation usable by actions. Conceptually, the input will be something
   * like "the function call argument containing the cursor" and the output will be something
   * like "line 3, characters 5 through 10".
   * @param context Captures the environment needed to convert the abstract target
   *    description given by the user to a concrete representation usable by
   *    actions
   * @param targets The abstract target representations provided by the user
   * @returns A list of lists of typed selections, one list per input target. Each
   * typed selection includes the selection, as well the uri of the document
   * containing it, and potentially rich context information such as how to remove
   * the target
   */
  run(): Target[] {
    return uniqTargets(this.processTarget(this.target));
  }

  processTarget(target: TargetDescriptor): Target[] {
    switch (target.type) {
      case "list":
        return target.elements.flatMap((element) =>
          this.processTarget(element),
        );
      case "range":
        return this.processRangeTarget(target);
      case "primitive":
      case "implicit":
        return this.processPrimitiveTarget(target);
    }
  }

  processRangeTarget(targetDesc: RangeTargetDescriptor): Target[] {
    const anchorTargets = this.processPrimitiveTarget(targetDesc.anchor);
    const activeTargets = this.processPrimitiveTarget(targetDesc.active);

    return zip(anchorTargets, activeTargets).flatMap(
      ([anchorTarget, activeTarget]) => {
        if (anchorTarget == null || activeTarget == null) {
          throw new Error(
            "AnchorTargets and activeTargets lengths don't match",
          );
        }

        switch (targetDesc.rangeType) {
          case "continuous":
            return this.processContinuousRangeTarget(
              anchorTarget,
              activeTarget,
              targetDesc,
            );
          case "vertical":
            return targetsToVerticalTarget(
              anchorTarget,
              activeTarget,
              targetDesc.excludeAnchor,
              targetDesc.excludeActive,
            );
        }
      },
    );
  }

  processContinuousRangeTarget(
    anchorTarget: Target,
    activeTarget: Target,
    { excludeAnchor, excludeActive, exclusionScopeType }: RangeTargetDescriptor,
  ): Target[] {
    if (exclusionScopeType == null) {
      return [
        targetsToContinuousTarget(
          anchorTarget,
          activeTarget,
          excludeAnchor,
          excludeActive,
        ),
      ];
    }

    const isReversed = calcIsReversed(anchorTarget, activeTarget);

    // For "every" range targets, we need to be smart about how we handle
    // exclusion.  If the user says "every funk name air until bat", then the
    // implication is that they want to exclude "funk name bat".  We
    // unfortunately can't just run "funk name" on "bat" and then use regular
    // range exclusion, because we actually need exclude the entire *domain* of
    // "funk name" rather than just the content range, which is what traditional
    // range exclusion gives us.  If we were to exclude just the content range,
    // then when we subsequently run "every" on the resulting range, our
    // endpoint is still in the domain, so we just get "funk name bat" back
    // again. So instead, we use the equivalent of "previous funk name" to find
    // our endpoint and then just use an inclusive range ending with that target.
    return [
      targetsToContinuousTarget(
        excludeAnchor
          ? this.modifierStageFactory
              .create({
                type: "relativeScope",
                scopeType: exclusionScopeType,
                direction: isReversed ? "backward" : "forward",
                length: 1,
                offset: 1,
              })
              // NB: The following line assumes that content range is always
              // contained by domain, so that "every" will properly reconstruct
              // the target from the content range.
              .run(anchorTarget)[0]
          : anchorTarget,
        excludeActive
          ? this.modifierStageFactory
              .create({
                type: "relativeScope",
                scopeType: exclusionScopeType,
                direction: isReversed ? "forward" : "backward",
                length: 1,
                offset: 1,
              })
              .run(activeTarget)[0]
          : activeTarget,
        false,
        false,
      ),
    ];
  }

  /**
   * This function implements the modifier pipeline that is at the core of Cursorless target processing.
   * It proceeds as follows:
   *
   * 1. It begins by getting the output from the {@link markStage} (eg "air", "this", etc).
   * This output is a list of zero or more targets.
   * 2. It then constructs a pipeline from the modifiers on the {@link targetDescriptor}
   * 3. It then runs each pipeline stage in turn, feeding the first stage with
   * the list of targets output from the {@link markStage}.  For each pipeline
   * stage, it passes the targets from the previous stage to the pipeline stage
   * one by one.  For each target, the stage will output a list of zero or more output
   * targets.  It then concatenates all of these lists into the list of targets
   * that will be passed to the next pipeline stage.  This process is similar to
   * the way that [jq](https://stedolan.github.io/jq/) processes its inputs.
   *
   * @param targetDescriptor The description of the target, consisting of a mark
   * and zero or more modifiers
   * @returns The output of running the modifier pipeline on the output from the mark
   */
  processPrimitiveTarget(
    targetDescriptor: PrimitiveTargetDescriptor | ImplicitTargetDescriptor,
  ): Target[] {
    let markStage: MarkStage;
    let nonPositionModifierStages: ModifierStage[];
    let positionModifierStages: ModifierStage[];

    if (targetDescriptor.type === "implicit") {
      markStage = new ImplicitStage();
      nonPositionModifierStages = [];
      positionModifierStages = [];
    } else {
      markStage = this.markStageFactory.create(targetDescriptor.mark);
      positionModifierStages =
        targetDescriptor.destination == null
          ? []
          : [this.modifierStageFactory.create(targetDescriptor.destination)];
      nonPositionModifierStages = getModifierStagesFromTargetModifiers(
        this.modifierStageFactory,
        targetDescriptor.modifiers,
      );
    }

    // First, get the targets output by the mark
    const markOutputTargets = markStage.run();

    /**
     * The modifier pipeline that will be applied to construct our final targets
     */
    const modifierStages = [
      ...nonPositionModifierStages,
      ...this.actionPrePositionStages,
      ...positionModifierStages,
      ...this.actionFinalStages,

      // This performs auto-expansion to token when you say eg "take this" with an
      // empty selection
      new ContainingTokenIfUntypedEmptyStage(this.modifierStageFactory),
    ];

    // Run all targets through the modifier stages
    return processModifierStages(modifierStages, markOutputTargets);
  }
}

/** Convert a list of target modifiers to modifier stages */
export function getModifierStagesFromTargetModifiers(
  modifierStageFactory: ModifierStageFactory,
  targetModifiers: Modifier[],
) {
  // Reverse target modifiers because they are returned in reverse order from
  // the api, to match the order in which they are spoken.
  return targetModifiers.map(modifierStageFactory.create).reverse();
}

/** Run all targets through the modifier stages */
export function processModifierStages(
  modifierStages: ModifierStage[],
  targets: Target[],
) {
  // First we apply each stage in sequence, letting each stage see the targets
  // one-by-one and concatenating the results before passing them on to the
  // next stage.
  modifierStages.forEach((stage) => {
    targets = targets.flatMap((target) => stage.run(target));
  });

  // Then return the output from the final stage
  return targets;
}

function calcIsReversed(anchor: Target, active: Target) {
  if (anchor.contentRange.start.isAfter(active.contentRange.start)) {
    return true;
  }
  if (anchor.contentRange.start.isBefore(active.contentRange.start)) {
    return false;
  }
  return anchor.contentRange.end.isAfter(active.contentRange.end);
}

function uniqTargets(array: Target[]): Target[] {
  return uniqWith(array, (a, b) => a.isEqual(b));
}

function ensureSingleEditor(anchorTarget: Target, activeTarget: Target) {
  if (anchorTarget.editor !== activeTarget.editor) {
    throw new Error("Cannot form range between targets in different editors");
  }
}

export function targetsToContinuousTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean = false,
  excludeActive: boolean = false,
): Target {
  ensureSingleEditor(anchorTarget, activeTarget);

  const isReversed = calcIsReversed(anchorTarget, activeTarget);
  const startTarget = isReversed ? activeTarget : anchorTarget;
  const endTarget = isReversed ? anchorTarget : activeTarget;
  const excludeStart = isReversed ? excludeActive : excludeAnchor;
  const excludeEnd = isReversed ? excludeAnchor : excludeActive;

  return startTarget.createContinuousRangeTarget(
    isReversed,
    endTarget,
    !excludeStart,
    !excludeEnd,
  );
}

function targetsToVerticalTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean,
  excludeActive: boolean,
): Target[] {
  ensureSingleEditor(anchorTarget, activeTarget);

  const isReversed = calcIsReversed(anchorTarget, activeTarget);
  const delta = isReversed ? -1 : 1;

  const anchorPosition = isReversed
    ? anchorTarget.contentRange.start
    : anchorTarget.contentRange.end;
  const anchorLine = anchorPosition.line + (excludeAnchor ? delta : 0);
  const activePosition = isReversed
    ? activeTarget.contentRange.start
    : activeTarget.contentRange.end;
  const activeLine = activePosition.line - (excludeActive ? delta : 0);

  const results: Target[] = [];
  for (let i = anchorLine; true; i += delta) {
    const contentRange = new Range(
      i,
      anchorTarget.contentRange.start.character,
      i,
      anchorTarget.contentRange.end.character,
    );

    if (anchorTarget instanceof PositionTarget) {
      results.push(anchorTarget.withContentRange(contentRange));
    } else {
      results.push(
        new PlainTarget({
          editor: anchorTarget.editor,
          isReversed: anchorTarget.isReversed,
          contentRange,
        }),
      );
    }

    if (i === activeLine) {
      return results;
    }
  }
}
