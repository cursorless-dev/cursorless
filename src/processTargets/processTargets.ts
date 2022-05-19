import { zip } from "lodash";
import { Range } from "vscode";
import {
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  RemovalRange,
  Target,
  TargetDescriptor,
} from "../typings/target.types";
import BaseTarget from "./targets/BaseTarget";
import { ProcessedTargetsContext } from "../typings/Types";
import { filterDuplicates } from "../util/filterDuplicates";
import { parseRemovalRange } from "../util/targetUtils";
import getMarkStage from "./getMarkStage";
import getModifierStage from "./getModifierStage";

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
  return targets.map((target) =>
    filterDuplicates(processTarget(context, target))
  );
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
          return processContinuousRangeTarget(
            anchorTarget,
            activeTarget,
            targetDesc.excludeAnchor,
            targetDesc.excludeActive
          );
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
): Target[] {
  const isForward = calcIsForward(anchorTarget, activeTarget);
  const startTarget = isForward ? anchorTarget : activeTarget;
  const endTarget = isForward ? activeTarget : anchorTarget;
  const excludeStart = isForward ? excludeAnchor : excludeActive;
  const excludeEnd = isForward ? excludeActive : excludeAnchor;

  const contentStart = excludeStart
    ? startTarget.contentRange.end
    : startTarget.contentRange.start;
  const contentEnd = excludeEnd
    ? endTarget.contentRange.start
    : endTarget.contentRange.end;
  const contentRange = new Range(contentStart, contentEnd);

  const removalRange = ((): RemovalRange | undefined => {
    const startRange = parseRemovalRange(startTarget.removal);
    const endRange = parseRemovalRange(endTarget.removal);
    if (startRange == null && endRange == null) {
      return undefined;
    }
    const startRemovalRange =
      startTarget.removal?.range ?? startTarget.contentRange;
    const endRemovalRange = endTarget.removal?.range ?? endTarget.contentRange;
    return {
      range: new Range(startRemovalRange.start, endRemovalRange.end),
    };
  })();

  const leadingDelimiterRange = excludeStart
    ? startTarget.trailingDelimiter
    : startTarget.leadingDelimiter;
  const trailingDelimiterRange = excludeEnd
    ? endTarget.leadingDelimiter
    : endTarget.trailingDelimiter;

  const scopeType =
    startTarget.scopeType === endTarget.scopeType
      ? startTarget.scopeType
      : undefined;

  // If both objects are of the same type create a new object of the same
  const startConstructor = Object.getPrototypeOf(startTarget).constructor;
  const endConstructor = Object.getPrototypeOf(endTarget).constructor;
  const constructorFunk =
    startConstructor === endConstructor ? startConstructor : BaseTarget;

  return [
    new constructorFunk({
      editor: activeTarget.editor,
      isReversed: !isForward,
      delimiter: anchorTarget.delimiter,
      contentRange,
      scopeType,
      removal: removalRange,
      leadingDelimiter: leadingDelimiterRange,
      trailingDelimiter: trailingDelimiterRange,
    }),
  ];
}

export function targetsToContinuousTarget(
  anchorTarget: Target,
  activeTarget: Target
): Target {
  return processContinuousRangeTarget(
    anchorTarget,
    activeTarget,
    false,
    false
  )[0];
}

function processVerticalRangeTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean,
  excludeActive: boolean
): Target[] {
  const isForward = calcIsForward(anchorTarget, activeTarget);
  const delta = isForward ? 1 : -1;

  const anchorPosition = isForward
    ? anchorTarget.contentRange.end
    : anchorTarget.contentRange.start;
  const anchorLine = anchorPosition.line + (excludeAnchor ? delta : 0);
  const activePosition = isForward
    ? activeTarget.contentRange.end
    : activeTarget.contentRange.start;
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
      new BaseTarget({
        editor: anchorTarget.editor,
        isReversed: anchorTarget.isReversed,
        delimiter: anchorTarget.delimiter,
        position: anchorTarget.position,
        contentRange,
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

  for (let i = target.modifiers.length - 1; i > -1; --i) {
    const modifier = target.modifiers[i];
    const stage = getModifierStage(modifier);
    const stageTargets: Target[] = [];
    for (const target of targets) {
      stageTargets.push(...stage.run(context, target));
    }
    targets = stageTargets;
  }

  return targets;
}

function calcIsForward(anchor: Target, active: Target) {
  return anchor.contentRange.start.isBeforeOrEqual(active.contentRange.start);
}
