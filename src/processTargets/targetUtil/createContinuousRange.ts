import { Position, Range } from "vscode";
import { Target } from "../../typings/target.types";
import WeakTarget from "../targets/WeakTarget";

export function createContinuousRange(
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean
) {
  return createContinuousRangeFromRanges(
    startTarget.contentRange,
    endTarget.contentRange,
    includeStart,
    includeEnd
  );
}

export function createContinuousRangeFromRanges(
  startRange: Range,
  endRange: Range,
  includeStart: boolean,
  includeEnd: boolean
) {
  return new Range(
    includeStart ? startRange.start : startRange.end,
    includeEnd ? endRange.end : endRange.start
  );
}

export function createContinuousLineRange(
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean
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

export function createSimpleContinuousRangeTarget(
  target1: Target,
  target2: Target,
  isReversed: boolean,
  includeStart: boolean = true,
  includeEnd: boolean = true
) {
  const isForward = target1.contentRange.start.isBefore(
    target2.contentRange.start
  );
  const anchorTarget = isForward ? target1 : target2;
  const activeTarget = isForward ? target2 : target1;

  return anchorTarget.createContinuousRangeTarget(
    isReversed,
    activeTarget,
    includeStart,
    includeEnd
  );
}

export function createContinuousRangeWeakTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean
): WeakTarget {
  return new WeakTarget({
    editor: startTarget.editor,
    isReversed,
    contentRange: createContinuousRange(
      startTarget,
      endTarget,
      includeStart,
      includeEnd
    ),
  });
}
