import { Target } from "../typings/target.types";
import { isSameType } from "../util/typeUtils";
import {
  createContinuousLineRange,
  createContinuousRange,
} from "./targets/util/createContinuousRange";
import { LineTarget, UntypedTarget } from "./targets";

/**
 * Creates a target consisting of a range between two targets. If the targets
 * are of the same type, and {@link includeStart} and {@link includeEnd} are
 * `true`, then we call {@link Target.maybeCreateRichRangeTarget} on
 * {@link startTarget} to give it the opportunity to determine what the new
 * target looks like, ie whether it is a token target, its scope type, its
 * delimiters, etc
 *
 * If the targets are not of the same type, or {@link includeStart} and
 * {@link includeEnd} are `false`, then the target will be a line target if both
 * targets are line targets, otherwise it will be an untyped target.
 *
 * @param isReversed If `true`, active is before anchor
 * @param startTarget The start of the range
 * @param endTarget The end of the range
 * @param includeStart Whether to include the start of the range
 * @param includeEnd Whether to include the end of the range
 * @returns A target consisting of a range between {@link startTarget} and
 * {@link endTarget}
 */
export async function createContinuousRangeTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): Promise<Target> {
  if (includeStart && includeEnd && isSameType(startTarget, endTarget)) {
    const richTarget = await startTarget.maybeCreateRichRangeTarget(
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
