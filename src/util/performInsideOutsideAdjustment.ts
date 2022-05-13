import { TypedSelection } from "../typings/Types";
import { InsideOutsideType } from "../typings/target.types";
import { updateTypedSelectionRange } from "./selectionUtils";

export function performInsideOutsideAdjustment(
  selection: TypedSelection,
  preferredInsideOutsideType: InsideOutsideType = null
): TypedSelection {
  const insideOutsideType =
    selection.insideOutsideType ?? preferredInsideOutsideType;

  if (insideOutsideType === "outside") {
    if (selection.position !== "contents") {
      const delimiterRange =
        selection.position === "before"
          ? selection.selectionContext.leadingDelimiterRange
          : selection.selectionContext.trailingDelimiterRange;

      return delimiterRange == null
        ? selection
        : updateTypedSelectionRange(selection, delimiterRange);
    }

    const usedSelection =
      selection.selectionContext.outerSelection ??
      selection.selection.selection;

    const delimiterRange =
      selection.selectionContext.trailingDelimiterRange ??
      selection.selectionContext.leadingDelimiterRange;

    const range =
      delimiterRange != null
        ? usedSelection.union(delimiterRange)
        : usedSelection;

    return updateTypedSelectionRange(selection, range);
  }

  return selection;
}

export function performInsideAdjustment(selection: TypedSelection) {
  return performInsideOutsideAdjustment(selection, "inside");
}

export function performOutsideAdjustment(selection: TypedSelection) {
  return performInsideOutsideAdjustment(selection, "outside");
}
