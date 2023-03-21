import { Position } from "./Position";
import { Range } from "./Range";
import { TextEditor } from "./TextEditor";

/**
 * A range of lines in a document, unlike the standard {@link Range}, which is
 * logically between characters.  This type is used for things like breakpoints
 * and highlights, which can ether be logically applied to characters or entire
 * lines.
 *
 * For example, in VSCode, it is possible to highlight an entire line, which
 * will cause the highlight to extend the full width of the screen, rather than
 * just the width of the text in the given line.
 */
export interface LineRange {
  type: "line";
  start: number;
  /**
   * Last line, inclusive
   */
  end: number;
}

/**
 * A range of characters in a document.  This type is semantically identical to
 * the more common {@link Range}, but is used where a {@link GeneralizedRange}
 * is expected, to indicate that the range is between characters, rather than
 * complete lines.
 */
export interface CharacterRange {
  type: "character";
  start: Position;
  end: Position;
}

/**
 * A range of characters or lines in a document.  This type is used for things
 * like breakpoints and highlights, which can ether be logically applied to
 * characters or entire lines.
 *
 * For example, in VSCode, it is possible to highlight an entire line, which
 * will cause the highlight to extend the full width of the screen, rather than
 * just the width of the text in the given line.
 */
export type GeneralizedRange = CharacterRange | LineRange;

export interface EditorGeneralizedRange {
  editor: TextEditor;
  range: GeneralizedRange;
}

export function isLineRange(range: GeneralizedRange): range is LineRange {
  return range.type === "line";
}

export function toLineRange(range: Range): LineRange {
  return { type: "line", start: range.start.line, end: range.end.line };
}

export function toCharacterRange({ start, end }: Range): CharacterRange {
  return { type: "character", start, end };
}
