import { Position, Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";

export function createContinuousRange(
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
) {
  return createContinuousRangeFromRanges(
    startTarget.contentRange,
    endTarget.contentRange,
    includeStart,
    includeEnd,
  );
}

export function createContinuousRangeFromRanges(
  startRange: Range,
  endRange: Range,
  includeStart: boolean,
  includeEnd: boolean,
) {
  return new Range(
    includeStart ? startRange.start : startRange.end,
    includeEnd ? endRange.end : endRange.start,
  );
}

export function createContinuousLineRange(
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
) {
  const start = includeStart
    ? startTarget.contentRange.start
    : new Position(startTarget.contentRange.end.line + 1, 0);

  const end = includeEnd
    ? endTarget.contentRange.end
    : endTarget.editor.document.lineAt(endTarget.contentRange.start.line - 1)
        .range.end;

  return new Range(start, end);
}
