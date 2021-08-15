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

export default function (
  context: ProcessedTargetsContext,
  targets: Target[]
): TypedSelection[][] {
  return targets.map((target) =>
    // Removed duplicate selections
    processTarget(context, target).filter(
      (selection, index, selections) =>
        selections.findIndex((s) => isTypedSelectionEqual(s, selection)) ===
        index
    )
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

  if (anchorTargets.length !== activeTargets.length) {
    throw new Error("anchorTargets and activeTargets lengths don't match");
  }

  return zip(anchorTargets, activeTargets).map(
    ([anchorTarget, activeTarget]) => {
      if (anchorTarget!.selection.editor !== activeTarget!.selection.editor) {
        throw new Error(
          "anchorTarget and activeTarget must be in same document"
        );
      }

      const anchorSelection = anchorTarget!.selection.selection;
      const activeSelection = activeTarget!.selection.selection;

      const isStartBeforeEnd = anchorSelection.start.isBeforeOrEqual(
        activeSelection.start
      );

      const anchor = targetToRangeLimitPosition(
        anchorTarget!,
        isStartBeforeEnd,
        target.excludeAnchor
      );
      const active = targetToRangeLimitPosition(
        activeTarget!,
        !isStartBeforeEnd,
        target.excludeActive
      );

      const outerAnchor = target.excludeAnchor
        ? null
        : isStartBeforeEnd
        ? anchorTarget!.selectionContext.outerSelection?.start
        : anchorTarget!.selectionContext.outerSelection?.end;
      const outerActive = target.excludeActive
        ? null
        : isStartBeforeEnd
        ? activeTarget!.selectionContext.outerSelection?.end
        : activeTarget!.selectionContext.outerSelection?.start;
      const outerSelection =
        outerAnchor != null || outerActive != null
          ? new Selection(outerAnchor ?? anchor, outerActive ?? active)
          : null;

      const startSelectionContext = target.excludeAnchor
        ? null
        : anchorTarget!.selectionContext;
      const endSelectionContext = target.excludeActive
        ? null
        : activeTarget!.selectionContext;
      const leadingDelimiterRange = isStartBeforeEnd
        ? startSelectionContext?.leadingDelimiterRange
        : endSelectionContext?.leadingDelimiterRange;
      const trailingDelimiterRange = isStartBeforeEnd
        ? endSelectionContext?.trailingDelimiterRange
        : startSelectionContext?.trailingDelimiterRange;

      return {
        selection: {
          selection: new Selection(anchor, active),
          editor: anchorTarget!.selection.editor,
        },
        selectionType: anchorTarget!.selectionType,
        selectionContext: {
          containingListDelimiter:
            anchorTarget!.selectionContext.containingListDelimiter,
          isInDelimitedList: anchorTarget!.selectionContext.isInDelimitedList,
          leadingDelimiterRange,
          trailingDelimiterRange,
          outerSelection,
        },
        insideOutsideType: anchorTarget!.insideOutsideType,
        position: "contents",
      };
    }
  );
}

/**
 * Given a target which forms one end of a range target, do necessary
 * adjustments to get the proper position for the output range
 * @param target The target to get position from
 * @param isStart If true this position is the start of the range
 * @param exclude If true the content of this position should be excluded
 */
function targetToRangeLimitPosition(
  target: TypedSelection,
  isStart: boolean,
  exclude: boolean
) {
  const selection = target.selection.selection;
  if (exclude) {
    const outerSelection = target!.selectionContext.outerSelection;
    const delimiterPosition = isStart
      ? target.selectionContext.trailingDelimiterRange?.end
      : target.selectionContext.leadingDelimiterRange?.start;
    if (outerSelection != null) {
      if (delimiterPosition != null) {
        return delimiterPosition;
      }
      return isStart ? outerSelection.end : outerSelection.start;
    }
    return isStart ? selection.end : selection.start;
  }
  return isStart ? selection.start : selection.end;
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

function isTypedSelectionEqual(a: TypedSelection, b: TypedSelection) {
  return (
    a.insideOutsideType === b.insideOutsideType &&
    a.position === b.position &&
    a.selectionType === b.selectionType &&
    a.selection.editor === b.selection.editor &&
    a.selection.selection.isEqual(b.selection.selection) &&
    isEqual(a.selectionContext, b.selectionContext)
  );
}
