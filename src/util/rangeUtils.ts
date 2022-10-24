import { Position, Range, TextDocument, TextEditor } from "vscode";

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

export function getRangeLength(editor: TextEditor, range: Range) {
  return range.isEmpty
    ? 0
    : editor.document.offsetAt(range.end) -
        editor.document.offsetAt(range.start);
}

/**
 * Returns
 *
 * ```
 * range1.start < range2.start && range1.end > range2.end
 * ```
 * @param range1 One of the ranges to compare
 * @param range2 The other range to compare
 * @returns A boolean indicating whether {@link range1} completely contains
 * {@link range2} without it touching either boundary
 */
export function strictlyContains(range1: Range, range2: Range): boolean {
  return range1.start.isBefore(range2.start) && range1.end.isAfter(range2.end);
}

/**
 * Get a range that corresponds to the entire contents of the given document.
 *
 * @param document The document to consider
 * @returns A range corresponding to the entire document contents
 */
export function getDocumentRange(document: TextDocument) {
  return new Range(
    new Position(0, 0),
    document.lineAt(document.lineCount - 1).range.end
  );
}
