import { TextEditor } from "@cursorless/common";
import { concat, flatten, flow, range, uniq } from "lodash";

/**
 * Returns a map from line numbers in the file to display lines, which skip
 * folded sections etc.  Note that if the cursor is currently offscreen, it
 * will add a line for the cursor before or after the screen lines depending
 * whether cursor is above or below last visible line.
 *
 * @param editor A visible editor
 */
export function getDisplayLineMap(editor: TextEditor) {
  return new Map(
    flow(
      flatten,
      uniq,
    )(
      concat(
        [[editor.selections[0].start.line]],
        editor.visibleRanges.map((visibleRange) =>
          range(visibleRange.start.line, visibleRange.end.line + 1),
        ),
      ),
    )
      .sort((a, b) => a - b)
      .map((value, index) => [value, index]),
  );
}
