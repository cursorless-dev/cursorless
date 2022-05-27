import { zip } from "lodash";
import { Range } from "vscode";
import {
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  Target,
  TargetDescriptor,
} from "../typings/target.types";
import { ProcessedTargetsContext } from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";
import uniqDeep from "../util/uniqDeep";
import getMarkStage from "./getMarkStage";
import getModifierStage from "./getModifierStage";
import ContinuousRangeTarget from "./targets/ContinuousRangeTarget";
import WeakTarget from "./targets/WeakTarget";

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
  return targets.map((target) => uniqDeep(processTarget(context, target)));
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

  return new ContinuousRangeTarget({
    startTarget: isReversed ? activeTarget : anchorTarget,
    endTarget: isReversed ? anchorTarget : activeTarget,
    excludeStart: isReversed ? excludeActive : excludeAnchor,
    excludeEnd: isReversed ? excludeAnchor : excludeActive,
    isReversed,
  });
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
    results.push(
      new WeakTarget({
        editor: anchorTarget.editor,
        isReversed: anchorTarget.isReversed,
        contentRange,
        position: anchorTarget.position,
      })
    );
    if (i === activeLine) {
      return results;
    }
  }
}

function processPrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTargetDescriptor
): Target[] {
  const markStage = getMarkStage(target.mark);
  let targets = markStage.run(context);

  const modifierStages = [
    // Reverse target modifiers because they are returned in reverse order from the api. Slice is needed to create a copy or the modifiers will be in wrong order in the test recorder.
    ...target.modifiers.slice().reverse().map(getModifierStage),
    ...context.finalStages,
  ];

  modifierStages.forEach((stage) => {
    const stageTargets: Target[] = [];
    for (const target of targets) {
      stageTargets.push(...stage.run(context, target));
    }
    targets = stageTargets;
  });

  return targets;
}

function calcIsReversed(anchor: Target, active: Target) {
  return anchor.contentRange.start.isAfter(active.contentRange.start);
}
