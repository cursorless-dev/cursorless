import type { Position, TextEditor } from "@cursorless/common";
import { Range, Selection } from "@cursorless/common";
import type { SelectionWithEditor } from "../typings/Types";

export function selectionWithEditorFromRange(
  selection: SelectionWithEditor,
  range: Range,
): SelectionWithEditor {
  return selectionWithEditorFromPositions(selection, range.start, range.end);
}

function selectionWithEditorFromPositions(
  selection: SelectionWithEditor,
  start: Position,
  end: Position,
): SelectionWithEditor {
  return {
    editor: selection.editor,
    selection: selectionFromPositions(selection.selection, start, end),
  };
}

function selectionFromPositions(
  selection: Selection,
  start: Position,
  end: Position,
): Selection {
  return !selection.isReversed
    ? new Selection(start, end)
    : new Selection(end, start);
}

/**
 * Return a copy of {@link range} excluding any leading or trailing whitespace.
 * If {@link range} contains only whitespace or is empty {@link range} will be returned unchanged.
 * @param editor The text editor to use
 * @param range The range to shrink down
 * @returns A new range equal or smaller to {@link range}
 */
export function shrinkRangeToFitContent(editor: TextEditor, range: Range) {
  const { document } = editor;
  const text = document.getText(range);
  const startDelta = text.length - text.trimStart().length;
  const endDelta = text.length - text.trimEnd().length;
  const startOffset = document.offsetAt(range.start) + startDelta;
  const endOffset = document.offsetAt(range.end) - endDelta;
  const start = document.positionAt(startOffset);
  const end = document.positionAt(endOffset);
  return new Range(start, end);
}
