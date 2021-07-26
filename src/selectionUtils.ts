import { Range, Selection, Position } from "vscode";
import update from "immutability-helper";
import { TypedSelection } from "./Types";

export function selectionFromRange(
  range: Range,
  isReversed: boolean
): Selection {
  const { start, end } = range;
  return isReversed ? new Selection(end, start) : new Selection(start, end);
}

export function updateTypedSelection(
  selection: TypedSelection,
  range: Range
): TypedSelection {
  return update(selection, {
    selection: {
      selection: () =>
        selectionFromRange(range, selection.selection.selection.isReversed),
    },
  });
}
