import { Position, Range, Selection } from "vscode";
import { SelectionWithEditor } from "../typings/Types";

export function isForward(selection: Selection) {
  return selection.active.isAfterOrEqual(selection.anchor);
}

export function isReversed(selection: Selection) {
  return selection.active.isBefore(selection.anchor);
}

export function selectionWithEditorFromRange(
  selection: SelectionWithEditor,
  range: Range
): SelectionWithEditor {
  return selectionWithEditorFromPositions(selection, range.start, range.end);
}

function selectionWithEditorFromPositions(
  selection: SelectionWithEditor,
  start: Position,
  end: Position
): SelectionWithEditor {
  return {
    editor: selection.editor,
    selection: selectionFromPositions(selection.selection, start, end),
  };
}

function selectionFromPositions(
  selection: Selection,
  start: Position,
  end: Position
): Selection {
  // The built in isReversed is bugged on empty selection. don't use
  return isForward(selection)
    ? new Selection(start, end)
    : new Selection(end, start);
}
