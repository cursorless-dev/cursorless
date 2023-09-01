import type { TextEditor } from "@cursorless/common";
import { Position, Range } from "@cursorless/common";
import { getLeadingWhitespace, getTrailingWhitespace } from "./regex";

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
    editor.document.lineAt(range.end).range.end,
  );
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
 * @param rangeOrPosition The other range or position to compare
 * @returns A boolean indicating whether {@link range1} completely contains
 * {@link rangeOrPosition} without it touching either boundary
 */
export function strictlyContains(
  range1: Range,
  rangeOrPosition: Range | Position,
): boolean {
  const [start, end] =
    rangeOrPosition instanceof Position
      ? [rangeOrPosition, rangeOrPosition]
      : [rangeOrPosition.start, rangeOrPosition.end];
  return range1.start.isBefore(start) && range1.end.isAfter(end);
}

/**
 * Trim the given range of whitespaces
 * @param editor The editor to get the text from
 * @param range The range to trim
 */
export function trimRange(editor: TextEditor, range: Range): Range {
  const text = editor.document.getText(range);
  const leadingWhitespace = getLeadingWhitespace(text);
  const trailingWhitespace = getTrailingWhitespace(text);

  if (leadingWhitespace === "" && trailingWhitespace === "") {
    return range;
  }

  const startOffset =
    editor.document.offsetAt(range.start) + leadingWhitespace.length;
  return new Range(
    editor.document.positionAt(startOffset),
    editor.document.positionAt(
      startOffset +
        text.length -
        leadingWhitespace.length -
        trailingWhitespace.length,
    ),
  );
}
