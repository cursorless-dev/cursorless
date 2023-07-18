import { Range, TextEditor, getLineRanges } from "@cursorless/common";
import { BorderStyle, StyledRange } from "../decorationStyle.types";
import { handleMultipleLines } from "./handleMultipleLines";

/**
 * Returns an iterable of styled ranges for the given range. If the range spans
 * multiple lines, we have complex logic to draw dotted / solid / no borders to ensure
 * that the range is visually distinct from adjacent ranges but looks continuous.
 */
export function* generateDecorationsForCharacterRange(
  editor: TextEditor,
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

  yield* handleMultipleLines(getLineRanges(editor, range));
}
