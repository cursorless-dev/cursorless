import { isEqual, zip } from "lodash";
import { Selection } from "vscode";
import { performInsideOutsideAdjustment } from "../util/performInsideOutsideAdjustment";
import {
  PrimitiveTarget,
  ProcessedTargetsContext,
  RangeTarget,
  Target,
  TypedSelection,
} from "../typings/Types";
import processMark from "./processMark";
import processModifier from "./processModifier";
import processPosition from "./processPosition";
import processSelectionType from "./processSelectionType";
import { isForward as getIsForward } from "../util/selectionUtils";

export default function (
  context: ProcessedTargetsContext,
  targets: Target[]
): TypedSelection[][] {
  return targets.map((target) =>
    filterDuplicateSelections(processTarget(context, target))
  );
}

function processTarget(
  context: ProcessedTargetsContext,
  target: Target
): TypedSelection[] {
  switch (target.type) {
    case "list":
      return target.elements.flatMap((element) =>
        processNonListTarget(context, element)
      );
    case "range":
    case "primitive":
      return processNonListTarget(context, target);
  }
}

function processNonListTarget(
  context: ProcessedTargetsContext,
  target: RangeTarget | PrimitiveTarget
): TypedSelection[] {
  let selections;
  switch (target.type) {
    case "range":
      selections = processRangeTarget(context, target);
      break;
    case "primitive":
      selections = processPrimitiveTarget(context, target);
      break;
  }
  return selections.map((selection) =>
    performInsideOutsideAdjustment(selection)
  );
}

function processRangeTarget(
  context: ProcessedTargetsContext,
  target: RangeTarget
): TypedSelection[] {
  const anchorTargets = processPrimitiveTarget(context, target.anchor);
  const activeTargets = processPrimitiveTarget(context, target.active);

  return zip(anchorTargets, activeTargets).map(
    ([anchorTarget, activeTarget]) => {
      if (anchorTarget == null || activeTarget == null) {
        throw new Error("anchorTargets and activeTargets lengths don't match");
      }

      if (anchorTarget.selection.editor !== activeTarget.selection.editor) {
        throw new Error(
          "anchorTarget and activeTarget must be in same document"
        );
      }

      const anchorSelection = anchorTarget.selection.selection;
      const activeSelection = activeTarget.selection.selection;

      const isForward = anchorSelection.start.isBeforeOrEqual(
        activeSelection.start
      );

      const anchor = targetToRangeLimitPosition(
        anchorTarget,
        isForward,
        !target.excludeAnchor
      );
      const active = targetToRangeLimitPosition(
        activeTarget,
        !isForward,
        !target.excludeActive
      );

      const outerAnchor = target.excludeAnchor
        ? null
        : isForward
        ? anchorTarget.selectionContext.outerSelection?.start
        : anchorTarget.selectionContext.outerSelection?.end;
      const outerActive = target.excludeActive
        ? null
        : isForward
        ? activeTarget.selectionContext.outerSelection?.end
        : activeTarget.selectionContext.outerSelection?.start;
      const outerSelection =
        outerAnchor != null || outerActive != null
          ? new Selection(outerAnchor ?? anchor, outerActive ?? active)
          : null;

      const startSelectionContext = target.excludeAnchor
        ? null
        : anchorTarget.selectionContext;
      const endSelectionContext = target.excludeActive
        ? null
        : activeTarget.selectionContext;
      const leadingDelimiterRange = isForward
        ? startSelectionContext?.leadingDelimiterRange
        : endSelectionContext?.leadingDelimiterRange;
      const trailingDelimiterRange = isForward
        ? endSelectionContext?.trailingDelimiterRange
        : startSelectionContext?.trailingDelimiterRange;

      return {
        selection: {
          selection: new Selection(anchor, active),
          editor: anchorTarget.selection.editor,
        },
        selectionType: anchorTarget.selectionType,
        selectionContext: {
          containingListDelimiter:
            anchorTarget.selectionContext.containingListDelimiter,
          isInDelimitedList: anchorTarget.selectionContext.isInDelimitedList,
          leadingDelimiterRange,
          trailingDelimiterRange,
          outerSelection,
        },
        insideOutsideType: anchorTarget.insideOutsideType,
        position: "contents",
      };
    }
  );
}

/**
 * Given a target which forms one end of a range target, do necessary
 * adjustments to get the proper position for the output range
 * @param target The target to get position from
 * @param isStartOfRange If true this position is the start of the range
 * @param exclude If true the content of this position should be excluded
 */
function targetToRangeLimitPosition(
  target: TypedSelection,
  isStartOfRange: boolean,
  includeTarget: boolean
) {
  const selection = target.selection.selection;

  if (includeTarget) {
    return isStartOfRange ? selection.start : selection.end;
  }

  const outerSelection = target.selectionContext.outerSelection;

  const delimiterPosition = isStartOfRange
    ? target.selectionContext.trailingDelimiterRange?.end
    : target.selectionContext.leadingDelimiterRange?.start;

  if (outerSelection != null) {
    if (delimiterPosition != null) {
      return delimiterPosition;
    }
    return isStartOfRange ? outerSelection.end : outerSelection.start;
  }
  return isStartOfRange ? selection.end : selection.start;
}

function processPrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget
): TypedSelection[] {
  const markSelections = processMark(context, target.mark);
  const modifiedSelections = markSelections.flatMap((markSelection) =>
    processModifier(context, target, markSelection)
  );
  const typedSelections = modifiedSelections.map(
    ({ selection, context: selectionContext }) =>
      processSelectionType(context, target, selection, selectionContext)
  );
  return typedSelections.map((selection) =>
    processPosition(context, target, selection)
  );
}

function filterDuplicateSelections(selections: TypedSelection[]) {
  return selections.filter(
    (selection, index, selections) =>
      selections.findIndex((s) => isEqual(s, selection)) === index
  );
}
