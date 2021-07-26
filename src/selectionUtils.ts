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

/**
 * Updates a typed selection so that the new selection has the new given range
 * preserving the direction of the original selection
 *
 * @param selection The original typed selection to Update
 * @param range The new range for the given selection
 * @returns The updated typed selection
 */
export function updateTypedSelectionRange(
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
