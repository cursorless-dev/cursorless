import { Target } from "../typings/target.types";
import { createContinuousRange } from "./targetUtil/createContinuousRange";
import { PlainTarget, UntypedTarget } from "./targets";

export function createContinuousRangeTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): Target {
  const richTarget = startTarget.maybeCreateRichRangeTarget(
    isReversed,
    endTarget,
    includeStart,
    includeEnd,
  );

  if (richTarget != null) {
    return richTarget;
  }

  if (!includeStart || !includeEnd) {
    return new PlainTarget({
      editor: startTarget.editor,
      contentRange: createContinuousRange(
        startTarget,
        endTarget,
        includeStart,
        includeEnd,
      ),
      isReversed,
      isToken: false,
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
    isToken: startTarget.isToken && endTarget.isToken,
  });
}
