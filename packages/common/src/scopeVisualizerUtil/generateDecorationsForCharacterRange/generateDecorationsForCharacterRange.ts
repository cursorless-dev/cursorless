import type { Range } from "../../types/Range";
import type { TextEditor } from "../../types/TextEditor";
import type { StyledRange } from "../decorationStyle.types";
import { BorderStyle } from "../decorationStyle.types";
import { handleMultipleLines } from "./handleMultipleLines";

/**
 * Returns an iterable of styled ranges for the given range. If the range spans
 * multiple lines, we have complex logic to draw dotted / solid / no borders to ensure
 * that the range is visually distinct from adjacent ranges but looks continuous.
 */
export function* generateDecorationsForCharacterRange(
  getLineRanges: (range: Range) => Range[],
  range: Range,
): Iterable<StyledRange> {
  if (range.isSingleLine) {
    yield {
      range,
      style: {
        top: BorderStyle.solid,
        right: BorderStyle.solid,
        bottom: BorderStyle.solid,
        left: BorderStyle.solid,
      },
    };
    return;
  }

  // A list of ranges, one for each line in the given range, with the first and
  // last ranges trimmed to the start and end of the given range.
  const lineRanges = getLineRanges(range);

  lineRanges[0] = lineRanges[0].with(range.start);
  lineRanges[lineRanges.length - 1] = lineRanges[lineRanges.length - 1].with(
    undefined,
    range.end,
  );

  yield* handleMultipleLines(lineRanges);
}
