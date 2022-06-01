import { Position, Range, TextEditor } from "vscode";

export function isAtEndOfLine(editor: TextEditor, position: Position) {
  const endLine = editor.document.lineAt(position);

  return position.isEqual(endLine.range.end);
}

export function isAtStartOfLine(position: Position) {
  return position.character === 0;
}

/**
 * Expands the given range to in the full line(s) containing it, including
 * leading and trailing white space.
 *
 * @param editor The editor
 * @param range The range to expand
 * @returns The expanded range
 */
export function expandToFullLine(editor: TextEditor, range: Range) {
  return new Range(
    new Position(range.start.line, 0),
    editor.document.lineAt(range.end).range.end
  );
}

export function makeEmptyRange(position: Position) {
  return new Range(position, position);
}
