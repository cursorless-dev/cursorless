import { Range, TextEditor } from "@cursorless/common";
import { range } from "lodash";
import { BorderStyle, StyledRange } from "./getDecorationRanges.types";
import { handleMultipleLines } from "./handleMultipleLines";

export function* generateDecorationsForCharacterRange(
  editor: TextEditor,
  characterRange: Range,
): Iterable<StyledRange> {
  if (characterRange.isSingleLine) {
    yield {
      range: characterRange,
      style: {
        top: BorderStyle.solid,
        right: BorderStyle.solid,
        bottom: BorderStyle.solid,
        left: BorderStyle.solid,
      },
    };
    return;
  }

  const { document } = editor;
  const lineRanges = range(
    characterRange.start.line,
    characterRange.end.line + 1,
  ).map((lineNumber) => document.lineAt(lineNumber).range);
  lineRanges[0] = lineRanges[0].with(characterRange.start);
  lineRanges[lineRanges.length - 1] = lineRanges[lineRanges.length - 1].with(
    undefined,
    characterRange.end,
  );

  yield* handleMultipleLines(lineRanges);
}
