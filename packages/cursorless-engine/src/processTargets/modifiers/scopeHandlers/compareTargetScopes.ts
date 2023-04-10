import { Position, Range } from "@cursorless/common";
import { Direction } from "@cursorless/common";
import { TargetScope } from "./scope.types";

/**
 * Defines the canonical scope ordering.
 *
 * @param direction The direction of iteration
 * @param position The initial position
 * @param param2 Scope A
 * @param param3 Scope B
 * @returns -1 if scope A should be yielded before scope B, 1 if scope A should
 * be yielded after scope B, and 0 if they are equivalent by this ordering
 */
export function compareTargetScopes(
  direction: Direction,
  position: Position,
  { domain: a }: TargetScope,
  { domain: b }: TargetScope,
): number {
  return direction === "forward"
    ? compareTargetScopesForward(position, a, b)
    : compareTargetScopesBackward(position, a, b);
}

function compareTargetScopesForward(position: Position, a: Range, b: Range): number {
  // First determine whether the start occurs before position.  If so, we will
  // only get to see the end when iterating forward.
  const aIsStartVisible = a.start.isAfterOrEqual(position);
  const bIsStartVisible = b.start.isAfterOrEqual(position);

  if (aIsStartVisible && bIsStartVisible) {
    // If both of them occur after or equal position, yield them according to
    // when they start, or yield smaller one first if they start at the same
    // place
    const value = a.start.compareTo(b.start);

    return value === 0 ? a.end.compareTo(b.end) : value;
  }

  if (!aIsStartVisible && !bIsStartVisible) {
    // If both of them start before position, compare their endpoints, yielding
    // the one that ends first, breaking ties by yielding smaller one first
    const value = a.end.compareTo(b.end);

    return value === 0 ? -a.start.compareTo(b.start) : value;
  }

  if (!aIsStartVisible && bIsStartVisible) {
    // If `a` starts before position, but `b` does not, then compare the end of
    // `a` to the start of `b`, returning whichever is smaller.
    const value = a.end.compareTo(b.start);

    // If they are tied, then start with `a` if it is empty, otherwise start
    // with `b` because it is ending and `a` is starting.
    return value !== 0 ? value : b.isEmpty ? 1 : -1;
  }

  // Otherwise `b` starts before position, but `a` does not.  Apply reverse
  // logic to last `if` statement above
  const value = a.start.compareTo(b.end);

  return value !== 0 ? value : a.isEmpty ? -1 : 1;
}

// FIXME: Unify this function with compareTargetScopesForward by constructing
// distal / proximal versions of these ranges
function compareTargetScopesBackward(position: Position, a: Range, b: Range): number {
  // First determine whether the end occurs after position.  If so, we will
  // only get to see the start when iterating backward.
  const aIsEndVisible = a.end.isBeforeOrEqual(position);
  const bIsEndVisible = b.end.isBeforeOrEqual(position);

  if (aIsEndVisible && bIsEndVisible) {
    // If both of them occur before or equal position, yield them according to
    // when they end, or yield smaller one first if they end at the same
    // place
    const value = -a.end.compareTo(b.end);

    return value === 0 ? -a.start.compareTo(b.start) : value;
  }

  if (!aIsEndVisible && !bIsEndVisible) {
    // If both of them end after position, compare their startpoints, yielding
    // the one that starts first, breaking ties by yielding smaller one first
    const value = -a.start.compareTo(b.start);

    return value === 0 ? a.end.compareTo(b.end) : value;
  }

  if (!aIsEndVisible && bIsEndVisible) {
    // If `a` ends after position, but `b` does not, then compare the start of
    // `a` to the end of `b`, returning whichever is greater.
    const value = -a.start.compareTo(b.end);

    // If they are tied, then start with `a` if it is empty, otherwise start
    // with `b` because it is starting and `a` is ending.
    return value !== 0 ? value : b.isEmpty ? 1 : -1;
  }

  // Otherwise `b` starts before position, but `a` does not.  Apply reverse
  // logic to last `if` statement above
  const value = -a.end.compareTo(b.start);

  return value !== 0 ? value : a.isEmpty ? -1 : 1;
}
