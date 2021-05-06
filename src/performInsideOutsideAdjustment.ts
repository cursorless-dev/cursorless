import update from "immutability-helper";
import { Selection } from "vscode";
import { InsideOutsideType, TypedSelection } from "./Types";

export function performInsideOutsideAdjustment(
  selection: TypedSelection,
  preferredInsideOutsideType: InsideOutsideType = null
) {
  const insideOutsideType =
    selection.insideOutsideType ?? preferredInsideOutsideType;

  if (insideOutsideType === "outside") {
    const delimiterRange =
      selection.selectionContext.trailingDelimiterRange ??
      selection.selectionContext.leadingDelimiterRange;

    if (delimiterRange == null) {
      return selection;
    }

    const range = selection.selection.selection.union(delimiterRange);

    return update(selection, {
      selection: {
        selection: (s) =>
          s.isReversed
            ? new Selection(range.end, range.start)
            : new Selection(range.start, range.end),
      },
    });
  }

  return selection;
}
