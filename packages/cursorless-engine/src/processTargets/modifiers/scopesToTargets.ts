import type { Target } from "../../typings/target.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { OutOfRangeError } from "./listUtils";

/**
 * Helper used by relative scope stages to construct the final target(s).
 *
 * @param scopeIter The scopes
 * @param desiredScopeCount How many scopes were requested
 * @param isEvery Whether to return scopes as a listor make a range
 * @param isReversed Whether target should be reversed selection
 * @returns Either a list of the input targets, or a range from first to last
 */
export function scopesToTargets(
  scopeIter: Iterable<TargetScope>,
  desiredScopeCount: number,
  isEvery: boolean,
  isReversed: boolean,
): Target[] {
  const scopes = Array.from(scopeIter);

  if (scopes.length < desiredScopeCount) {
    throw new OutOfRangeError();
  }

  if (isEvery) {
    return scopes.flatMap((scope) => scope.getTargets(isReversed));
  }

  return constructScopeRangeTarget(
    isReversed,
    scopes[0],
    scopes[scopes.length - 1],
  );
}
