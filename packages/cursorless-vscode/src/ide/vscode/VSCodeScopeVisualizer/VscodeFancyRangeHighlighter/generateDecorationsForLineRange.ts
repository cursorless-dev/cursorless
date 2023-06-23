import { Range } from "@cursorless/common";
import { BorderStyle, StyledRange } from "./getDecorationRanges.types";

export function* generateDecorationsForLineRange(
  startLine: number,
  endLine: number,
): Iterable<StyledRange> {
  const lineCount = endLine - startLine + 1;

  if (lineCount === 1) {
    yield {
      range: new Range(startLine, 0, startLine, 0),
      style: {
        top: BorderStyle.solid,
        right: BorderStyle.none,
        bottom: BorderStyle.solid,
        left: BorderStyle.none,
        isWholeLine: true,
      },
    };
    return;
  }

  yield {
    range: new Range(startLine, 0, startLine, 0),
    style: {
      top: BorderStyle.solid,
      right: BorderStyle.none,
      bottom: BorderStyle.none,
      left: BorderStyle.none,
      isWholeLine: true,
    },
  };

  if (lineCount > 2) {
    yield {
      range: new Range(startLine + 1, 0, endLine - 1, 0),
      style: {
        top: BorderStyle.none,
        right: BorderStyle.none,
        bottom: BorderStyle.none,
        left: BorderStyle.none,
        isWholeLine: true,
      },
    };
  }

  yield {
    range: new Range(endLine, 0, endLine, 0),
    style: {
      top: BorderStyle.none,
      right: BorderStyle.none,
      bottom: BorderStyle.solid,
      left: BorderStyle.none,
      isWholeLine: true,
    },
  };
}
