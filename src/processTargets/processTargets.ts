import { zip } from "lodash";
import { Range } from "vscode";
import {
  PrimitiveTargetDesc,
  RangeTargetDesc,
  Target,
  TargetDesc,
} from "../typings/target.types";
import { ProcessedTargetsContext } from "../typings/Types";
import { filterDuplicates } from "../util/filterDuplicates";
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
  targets: TargetDesc[]
): Target[][] {
  return targets.map((target) =>
    filterDuplicates(processTarget(context, target))
  );
}

function processTarget(
  context: ProcessedTargetsContext,
  target: TargetDesc
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
  targetDesc: RangeTargetDesc
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
  const anchorContext = excludeAnchor ? undefined : anchorTarget;
  const activeContext = excludeActive ? undefined : activeTarget;

  const contentRange = unionRanges(
    isForward,
    excludeAnchor,
    excludeActive,
    anchorTarget.contentRange,
    activeTarget.contentRange
  )!;

  const interiorRange = unionRanges(
    isForward,
    excludeAnchor,
    excludeActive,
    anchorTarget.interiorRange,
    activeTarget.interiorRange
  );

  const hasRemovalRange =
    anchorContext?.removal?.range != null ||
    activeContext?.removal?.range != null;
  const anchorRemovalRange = hasRemovalRange
    ? anchorContext?.removal?.range ?? anchorContext?.contentRange
    : undefined;
  const activeRemovalRange = hasRemovalRange
    ? activeContext?.removal?.range ?? activeContext?.contentRange
    : undefined;
  const removalRange = unionRanges(
    isForward,
    excludeAnchor,
    excludeActive,
    anchorRemovalRange,
    activeRemovalRange
  );

  const leadingDelimiterRange = isForward
    ? anchorContext?.removal?.leadingDelimiterRange
    : activeContext?.removal?.leadingDelimiterRange;
  const trailingDelimiterRange = isForward
    ? activeContext?.removal?.trailingDelimiterRange
    : anchorContext?.removal?.trailingDelimiterRange;

  const leadingDelimiterHighlightRange = isForward
    ? anchorContext?.removal?.leadingDelimiterHighlightRange
    : activeContext?.removal?.leadingDelimiterHighlightRange;
  const trailingDelimiterHighlightRange = isForward
    ? activeContext?.removal?.trailingDelimiterHighlightRange
    : anchorContext?.removal?.trailingDelimiterHighlightRange;

  return [
    {
      editor: activeTarget.editor,
      isReversed: !isForward,
      delimiter: anchorTarget.delimiter,
      contentRange,
      interiorRange,
      removal: {
        range: removalRange,
        leadingDelimiterRange,
        trailingDelimiterRange,
        leadingDelimiterHighlightRange,
        trailingDelimiterHighlightRange,
      },
    },
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

function unionRanges(
  isForward: boolean,
  excludeAnchor: boolean,
  excludeActive: boolean,
  anchor?: Range,
  active?: Range
) {
  if (anchor == null || active == null) {
    return anchor == null ? active : anchor;
  }
  return new Range(
    getPosition(anchor, isForward, excludeAnchor),
    getPosition(active, !isForward, excludeActive)
  );
}

function getPosition(range: Range, isStartOfRange: boolean, exclude: boolean) {
  if (exclude) {
    return isStartOfRange ? range.end : range.start;
  }
  return isStartOfRange ? range.start : range.end;
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
    results.push({
      editor: anchorTarget.editor,
      isReversed: anchorTarget.isReversed,
      delimiter: anchorTarget.delimiter,
      position: anchorTarget.position,
      contentRange: new Range(
        i,
        anchorTarget.contentRange.start.character,
        i,
        anchorTarget.contentRange.end.character
      ),
    });
    if (i === activeLine) {
      return results;
    }
  }
}

function processPrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTargetDesc
): Target[] {
  const markStage = getMarkStage(target.mark);
  let selections = markStage.run(context);

  for (let i = target.modifiers.length - 1; i > -1; --i) {
    const modifier = target.modifiers[i];
    const stage = getModifierStage(modifier);
    const stageSelections: Target[] = [];
    for (const selection of selections) {
      const stageResult = stage.run(context, selection);
      if (Array.isArray(stageResult)) {
        stageSelections.push(...stageResult);
      } else {
        stageSelections.push(stageResult);
      }
    }
    selections = stageSelections;
  }

  return selections;
}

function calcIsForward(anchor: Target, active: Target) {
  return anchor.contentRange.start.isBeforeOrEqual(active.contentRange.start);
}
