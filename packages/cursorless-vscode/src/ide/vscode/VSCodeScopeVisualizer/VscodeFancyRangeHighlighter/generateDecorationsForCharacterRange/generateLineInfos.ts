import { Range } from "@cursorless/common";

/**
 * Generates a line info for each line in the given range, which includes
 * information about the given line range, as well as the previous and next
 * lines, and whether each line is first / last, etc.  For use in
 * {@link handleMultipleLines}.
 * @param lineRanges A list of ranges, one for each line in the given range,
 * with the first and last ranges trimmed to the start and end of the original
 * range.
 */
export function* generateLineInfos(lineRanges: Range[]): Iterable<LineInfo> {
  for (let i = 0; i < lineRanges.length; i++) {
    const previousLine = i === 0 ? null : lineRanges[i - 1];
    const currentLine = lineRanges[i];
    const nextLine = i === lineRanges.length - 1 ? null : lineRanges[i + 1];

    yield {
      lineNumber: currentLine.start.line,

      previousLine:
        previousLine == null
          ? null
          : {
              start: previousLine.start.character,
              end: previousLine.end.character,
              isFirst: i === 1,
              isLast: false,
            },

      currentLine: {
        start: currentLine.start.character,
        end: currentLine.end.character,
        isFirst: i === 0,
        isLast: i === lineRanges.length - 1,
      },

      nextLine:
        nextLine == null
          ? null
          : {
              start: nextLine.start.character,
              end: nextLine.end.character,
              isFirst: false,
              isLast: i === lineRanges.length - 2,
            },
    };
  }
}

export interface LineInfo {
  lineNumber: number;
  previousLine: Line | null;
  currentLine: Line;
  nextLine: Line | null;
}

interface Line {
  /**
   * Start character.  Always 0, except for possibly the first line of the
   * original range.
   */
  start: number;
  /** End character */
  end: number;
  /** `true` if this line is the first line in the original range */
  isFirst: boolean;
  /** `true` if this line is the last line in the original range */
  isLast: boolean;
}
