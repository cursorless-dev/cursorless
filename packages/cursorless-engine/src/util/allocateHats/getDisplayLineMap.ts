import type { TextEditor } from "@cursorless/common";
import { concat, flatten, flow, range, uniq } from "lodash";

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
  return new Map(
    flow(
      flatten,
      uniq,
    )(
      concat(
        [extraLines],
        editor.visibleRanges.map((visibleRange) =>
          range(visibleRange.start.line, visibleRange.end.line + 1),
        ),
      ),
    )
      .sort((a, b) => a - b)
      .map((value, index) => [value, index]),
  );
}
