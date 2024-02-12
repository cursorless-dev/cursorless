import { Range } from "@cursorless/common";

/**
 * Given the code of a fixture and a range, return a string that annotates the
 * range in the code. For example, given the code:
 *
 * ```
 * aaa bbb
 * ccc
 *
 * ddd eee
 * ```
 *
 * and the range (0, 4)-(3, 3), this function will return:
 *
 * ```
 * 0| aaa bbb
 *       >---
 * 1| ccc
 *    ---
 * 2|
 *
 * 3| ddd eee
 *    ---<
 * ```
 *
 * @param codeLines The code of the fixture, split into lines
 * @param range The range to represent
 * @returns A string that annotates {@link range} in {@link codeLines}
 */
export function serializeTargetRange(
  codeLines: string[],
  range: Range,
): string {
  const { start, end } = range;
  const lines: string[] = [];

  for (let lineNumber = start.line; lineNumber <= end.line; ++lineNumber) {
    const codeLine = codeLines[lineNumber]!;

    // Add start of range above the first code line
    if (lineNumber === start.line) {
      const prefix = fill(" ", start.character + 2) + ">";
      if (range.isSingleLine) {
        lines.push(prefix + fill("-", end.character - start.character) + "<");
      } else {
        lines.push(prefix + fill("-", codeLine.length - start.character));
      }
    }

    // Output the line itself, prefixed by `n| `, eg `3| const foo = "bar"`
    lines.push(
      codeLine.length > 0 ? `${lineNumber}| ${codeLine}` : `${lineNumber}|`,
    );

    // Add end of range below the last code line (if this was a multiline range)
    if (lineNumber === end.line && !range.isSingleLine) {
      lines.push("   " + fill("-", end.character) + "<");
    }
  }

  return lines.join("\n");
}
function fill(character: string, count: number): string {
  return new Array(count + 1).join(character);
}
