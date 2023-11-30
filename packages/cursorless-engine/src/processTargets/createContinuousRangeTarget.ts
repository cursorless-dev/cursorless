import { Target } from "../typings/target.types";
import { isSameType } from "../util/typeUtils";
import {
  createContinuousLineRange,
  createContinuousRange,
} from "./targetUtil/createContinuousRange";
import { LineTarget, UntypedTarget } from "./targets";

export function createContinuousRangeTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): Target {
  if (includeStart && includeEnd && isSameType(startTarget, endTarget)) {
    const richTarget = startTarget.maybeCreateRichRangeTarget(
      isReversed,
      endTarget,
    );

    if (richTarget != null) {
      return richTarget;
    }
  }

  if (startTarget.isLine && endTarget.isLine) {
    return new LineTarget({
      editor: startTarget.editor,
      isReversed,
      contentRange: createContinuousLineRange(
        startTarget,
        endTarget,
        includeStart,
        includeEnd,
      ),
    });
  }

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
    isToken:
      includeStart && includeEnd && startTarget.isToken && endTarget.isToken,
  });
}
