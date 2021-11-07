import { Range, Selection, Position } from "vscode";
import update from "immutability-helper";
import { TypedSelection, SelectionWithEditor } from "../typings/Types";

export function selectionFromRange(
  selection: Selection,
  range: Range
): Selection {
  return selectionFromPositions(selection, range.start, range.end);
}

export function selectionFromPositions(
  selection: Selection,
  start: Position,
  end: Position
): Selection {
  // The built in isReversed is bugged on empty selection. don't use
  return isForward(selection)
    ? new Selection(start, end)
    : new Selection(end, start);
}

export function isForward(selection: Selection) {
  return selection.active.isAfterOrEqual(selection.anchor);
}

export function selectionWithEditorFromRange(
  selection: SelectionWithEditor,
  range: Range
): SelectionWithEditor {
  return selectionWithEditorFromPositions(selection, range.start, range.end);
}

export function selectionWithEditorFromPositions(
  selection: SelectionWithEditor,
  start: Position,
  end: Position
): SelectionWithEditor {
  return {
    editor: selection.editor,
    selection: selectionFromPositions(selection.selection, start, end),
  };
}

/**
 * Returns a copy of the given typed selection so that the new selection has the new given range
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
      selection: () => selectionFromRange(selection.selection.selection, range),
    },
  });
}
