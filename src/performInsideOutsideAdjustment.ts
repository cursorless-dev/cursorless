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

    const usedSelection =
      selection.selectionContext.outerSelection ??
      selection.selection.selection;

    if (delimiterRange == null) {
      return update(selection, {
        selection: {
          selection: () => usedSelection,
        },
      });
    }

    const range = usedSelection.union(delimiterRange);

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

export function performInsideAdjustment(selection: TypedSelection) {
  return performInsideOutsideAdjustment(selection, "inside");
}

export function performOutsideAdjustment(selection: TypedSelection) {
  return performInsideOutsideAdjustment(selection, "outside");
}
