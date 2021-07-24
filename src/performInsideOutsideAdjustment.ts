import { InsideOutsideType, TypedSelection } from "./Types";
import { newTypedSelection } from "./selectionUtils";

export function performInsideOutsideAdjustment(
  selection: TypedSelection,
  preferredInsideOutsideType: InsideOutsideType = null
) {
  const insideOutsideType =
    selection.insideOutsideType ?? preferredInsideOutsideType;

  if (insideOutsideType === "outside") {
    if (selection.position !== "contents") {
      const delimiterRange =
        selection.position === "before"
          ? selection.selectionContext.leadingDelimiterRange
          : selection.selectionContext.trailingDelimiterRange;
      if (delimiterRange != null) {
        return newTypedSelection(selection, delimiterRange);
      }
      return selection;
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

    return newTypedSelection(selection, range);
  }

  return selection;
}

export function performInsideAdjustment(selection: TypedSelection) {
  return performInsideOutsideAdjustment(selection, "inside");
}

export function performOutsideAdjustment(selection: TypedSelection) {
  return performInsideOutsideAdjustment(selection, "outside");
}
