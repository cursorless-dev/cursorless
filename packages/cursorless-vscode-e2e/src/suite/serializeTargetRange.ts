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

  codeLines.forEach((codeLine, lineNumber) => {
    let annotationLine: string | undefined;
    if (lineNumber === start.line) {
      const prefix = fill(" ", start.character + 2) + ">";
      if (start.line === end.line) {
        annotationLine =
          prefix + fill("-", end.character - start.character) + "<";
      } else {
        annotationLine = prefix + fill("-", codeLine.length - start.character);
      }
    } else if (lineNumber > start.line && lineNumber < end.line) {
      if (codeLine.length > 0) {
        annotationLine = "   " + fill("-", codeLine.length);
      } else {
        annotationLine = "";
      }
    } else if (lineNumber === end.line) {
      annotationLine = "   " + fill("-", end.character) + "<";
    }

    if (annotationLine != null) {
      // Only output anything if there is an annotation line
      lines.push(
        // Output the line itself, prefixed by `n| `, eg `3| const foo = "bar"`
        codeLine.length > 0 ? `${lineNumber}| ${codeLine}` : `${lineNumber}|`,
        annotationLine,
      );
    }
  });

  return lines.join("\n");
}
function fill(character: string, count: number): string {
  return new Array(count + 1).join(character);
}
