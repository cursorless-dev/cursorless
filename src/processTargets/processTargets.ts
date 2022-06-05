import { uniqWith, zip } from "lodash";
import { Range } from "vscode";
import { Target } from "../typings/target.types";
import {
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  TargetDescriptor,
} from "../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";
import getMarkStage from "./getMarkStage";
import getModifierStage from "./getModifierStage";
import PlainTarget from "./targets/PlainTarget";
import PositionTarget from "./targets/PositionTarget";

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
export default function (
  context: ProcessedTargetsContext,
  targets: TargetDescriptor[]
): Target[][] {
  return targets.map((target) => uniqTargets(processTarget(context, target)));
}

function processTarget(
  context: ProcessedTargetsContext,
  target: TargetDescriptor
): Target[] {
  switch (target.type) {
    case "list":
      return target.elements.flatMap((element) =>
        processTarget(context, element)
      );
    case "range":
      return processRangeTarget(context, target);
    case "primitive":
      return processPrimitiveTarget(context, target);
  }
}

function processRangeTarget(
  context: ProcessedTargetsContext,
  targetDesc: RangeTargetDescriptor
): Target[] {
  const anchorTargets = processPrimitiveTarget(context, targetDesc.anchor);
  const activeTargets = processPrimitiveTarget(context, targetDesc.active);

  return zip(anchorTargets, activeTargets).flatMap(
    ([anchorTarget, activeTarget]) => {
      if (anchorTarget == null || activeTarget == null) {
        throw new Error("anchorTargets and activeTargets lengths don't match");
      }

      if (anchorTarget.editor !== activeTarget.editor) {
        throw new Error(
          "anchorTarget and activeTarget must be in same document"
        );
      }

      switch (targetDesc.rangeType) {
        case "continuous":
          return [
            processContinuousRangeTarget(
              anchorTarget,
              activeTarget,
              targetDesc.excludeAnchor,
              targetDesc.excludeActive
            ),
          ];
        case "vertical":
          return processVerticalRangeTarget(
            anchorTarget,
            activeTarget,
            targetDesc.excludeAnchor,
            targetDesc.excludeActive
          );
      }
    }
  );
}

function processContinuousRangeTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean,
  excludeActive: boolean
): Target {
  ensureSingleEditor([anchorTarget, activeTarget]);
  const isReversed = calcIsReversed(anchorTarget, activeTarget);
  const startTarget = isReversed ? activeTarget : anchorTarget;
  const endTarget = isReversed ? anchorTarget : activeTarget;
  const excludeStart = isReversed ? excludeActive : excludeAnchor;
  const excludeEnd = isReversed ? excludeAnchor : excludeActive;

  return startTarget.createContinuousRangeTarget(
    isReversed,
    endTarget,
    !excludeStart,
    !excludeEnd
  );
}

export function targetsToContinuousTarget(
  anchorTarget: Target,
  activeTarget: Target
): Target {
  return processContinuousRangeTarget(anchorTarget, activeTarget, false, false);
}

function processVerticalRangeTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean,
  excludeActive: boolean
): Target[] {
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
      anchorTarget.contentRange.end.character
    );

    if (anchorTarget instanceof PositionTarget) {
      results.push(anchorTarget.withContentRange(contentRange));
    } else {
      results.push(
        new PlainTarget({
          editor: anchorTarget.editor,
          isReversed: anchorTarget.isReversed,
          contentRange,
        })
      );
    }

    if (i === activeLine) {
      return results;
    }
  }
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
 * @param context The context that captures the state of the environment used
 * by each stage to process its input targets
 * @param targetDescriptor The description of the target, consisting of a mark
 * and zero or more modifiers
 * @returns The output of running the modifier pipeline on the output from the mark
 */
function processPrimitiveTarget(
  context: ProcessedTargetsContext,
  targetDescriptor: PrimitiveTargetDescriptor
): Target[] {
  // First, get the targets output by the mark
  const markStage = getMarkStage(targetDescriptor.mark);
  const markOutputTargets = markStage.run(context);

  /**
   * The modifier pipeline that will be applied to construct our final targets
   */
  const modifierStages = [
    // Reverse target modifiers because they are returned in reverse order from
    // the api, to match the order in which they are spoken.
    ...targetDescriptor.modifiers.map(getModifierStage).reverse(),
    ...context.finalStages,
  ];

  /**
   * Intermediate variable to store the output of the current pipeline stage.
   * We initialise it to start with the outputs from the mark.
   */
  let currentTargets = markOutputTargets;

  // Then we apply each stage in sequence, letting each stage see the targets
  // one-by-one and concatenating the results before passing them on to the
  // next stage.
  modifierStages.forEach((stage) => {
    currentTargets = currentTargets.flatMap((target) =>
      stage.run(context, target)
    );
  });

  // Then return the output from the final stage
  return currentTargets;
}

function calcIsReversed(anchor: Target, active: Target) {
  return anchor.contentRange.start.isAfter(active.contentRange.start);
}

function uniqTargets(array: Target[]): Target[] {
  return uniqWith(array, (a, b) => a.isEqual(b));
}
