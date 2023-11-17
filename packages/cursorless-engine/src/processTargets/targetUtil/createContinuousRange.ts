import { Position, Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { UntypedTarget } from "../targets";
import { isSameType } from "../../util/typeUtils";

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

export function createContinuousRangeUntypedTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): UntypedTarget {
  return new UntypedTarget({
    editor: startTarget.editor,
    isReversed,
    hasExplicitRange: true,
    contentRange: createContinuousRange(
      startTarget,
      endTarget,
      includeStart,
      includeEnd,
    ),
    isToken: startTarget.isToken && endTarget.isToken,
  });
}

export function createContinuousRangeOrUntypedTarget(
  isReversed: boolean,
  startTarget: Target,
  cloneParameters: any,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): Target {
  if (isSameType(startTarget, endTarget)) {
    const constructor = Object.getPrototypeOf(startTarget).constructor;

    return new constructor({
      ...cloneParameters,
      isReversed,
      contentRange: createContinuousRange(
        startTarget,
        endTarget,
        includeStart,
        includeEnd,
      ),
    });
  }

  return createContinuousRangeUntypedTarget(
    isReversed,
    startTarget,
    endTarget,
    includeStart,
    includeEnd,
  );
}
