import { range, uniq } from "lodash-es";
import type { TextEditor } from "@cursorless/lib-common";

/**
 * Returns a map from line numbers in the file to display lines, which skip
 * folded sections etc.
 *
 * @param editor A visible editor
 * @param extraLines Optional extra lines to include in the map
 */
export function getDisplayLineMap(
  editor: TextEditor,
  extraLines: number[] = [],
): Map<number, number> {
  const lines = uniq([
    ...extraLines,
    ...editor.visibleRanges.flatMap((visibleRange) =>
      range(visibleRange.start.line, visibleRange.end.line + 1),
    ),
  ]).sort((a, b) => a - b);

  return new Map(lines.map((value, index) => [value, index]));
}
