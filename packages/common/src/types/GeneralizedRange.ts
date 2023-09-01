import type { Position } from "./Position";
import type { Range } from "./Range";
import type { TextEditor } from "./TextEditor";

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

export function isGeneralizedRangeEqual(
  a: GeneralizedRange,
  b: GeneralizedRange,
): boolean {
  if (a.type === "character" && b.type === "character") {
    return a.start.isEqual(b.start) && a.end.isEqual(b.end);
  }

  if (a.type === "line" && b.type === "line") {
    return a.start === b.start && a.end === b.end;
  }

  return false;
}

/**
 * Determines whether {@link a} contains {@link b}.  This is true if {@link a}
 * starts before or equal to the start of {@link b} and ends after or equal to
 * the end of {@link b}.
 *
 * Note that if {@link a} is a {@link CharacterRange} and {@link b} is a
 * {@link LineRange}, we require that the {@link LineRange} is fully contained
 * in the {@link CharacterRange}, because otherwise it visually looks like the
 * {@link LineRange} is not contained because the line range extends to the edge
 * of the screen.
 * @param a A generalized range
 * @param b A generalized range
 * @returns `true` if `a` contains `b`, `false` otherwise
 */
export function generalizedRangeContains(
  a: GeneralizedRange,
  b: GeneralizedRange,
): boolean {
  if (a.type === "character") {
    if (b.type === "character") {
      // a.type === "character" && b.type === "character"
      return a.start.isBeforeOrEqual(b.start) && a.end.isAfterOrEqual(b.end);
    }

    // a.type === "character" && b.type === "line"
    // Require that the line range is fully contained in the character range
    // because otherwise it visually looks like the line range is not contained
    return a.start.line < b.start && a.end.line > b.end;
  }

  if (b.type === "line") {
    // a.type === "line" && b.type === "line"
    return a.start <= b.start && a.end >= b.end;
  }

  // a.type === "line" && b.type === "character"
  return a.start <= b.start.line && a.end >= b.end.line;
}

/**
 * Determines whether {@link a} touches {@link b}.  This is true if {@link a}
 * has any intersection with {@link b}, even if the intersection is empty.
 *
 * In the case where one range is a {@link CharacterRange} and the other is a
 * {@link LineRange}, we return `true` if they both include at least one line
 * in common.
 * @param a A generalized range
 * @param b A generalized range
 * @returns `true` if `a` touches `b`, `false` otherwise
 */
export function generalizedRangeTouches(
  a: GeneralizedRange,
  b: GeneralizedRange,
): boolean {
  if (a.type === "character") {
    if (b.type === "character") {
      // a.type === "character" && b.type === "character"
      return a.start.isBeforeOrEqual(b.end) && a.end.isAfterOrEqual(b.start);
    }

    // a.type === "character" && b.type === "line"
    return a.start.line <= b.end && a.end.line >= b.start;
  }

  if (b.type === "line") {
    // a.type === "line" && b.type === "line"
    return a.start <= b.end && a.end >= b.start;
  }

  // a.type === "line" && b.type === "character"
  return a.start <= b.end.line && a.end >= b.start.line;
}
