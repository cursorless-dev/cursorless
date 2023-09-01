import type { Target } from "../../typings/target.types";
import type { TargetScope } from "./scopeHandlers/scope.types";

/**
 * Constructs a target consisting of a range between {@link scope1} and
 * {@link scope2}. The order of {@link scope1} and {@link scope2} doesn't matter;
 * this function will automatically figure out which one should be the start of
 * the range, and which should be the end.
 * @param isReversed Whether the returned target should have active before
 * anchor
 * @param scope1 A scope forming one end of the range
 * @param scope2 A scope forming another end of the range
 * @returns A target consisting of a range between {@link scope1} and
 * {@link scope2}
 */
export function constructScopeRangeTarget(
  isReversed: boolean,
  scope1: TargetScope,
  scope2: TargetScope,
): Target[] {
  if (scope1 === scope2) {
    return scope1.getTargets(isReversed);
  }

  const targets1 = scope1.getTargets(isReversed);
  const targets2 = scope2.getTargets(isReversed);

  if (targets1.length !== 1 || targets2.length !== 1) {
    throw Error("Scope range targets must be single-target");
  }

  const [target1] = targets1;
  const [target2] = targets2;

  const isScope2After = target2.contentRange.start.isAfterOrEqual(
    target1.contentRange.start,
  );

  const [startTarget, endTarget] = isScope2After
    ? [target1, target2]
    : [target2, target1];

  return [
    startTarget.createContinuousRangeTarget(isReversed, endTarget, true, true),
  ];
}
