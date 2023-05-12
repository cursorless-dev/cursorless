import { Position, Range } from "@cursorless/common";
import { Direction } from "@cursorless/common";
import { strictlyContains } from "../../../util/rangeUtils";
import { compareTargetScopes } from "./compareTargetScopes";
import { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

/**
 * This function is used to filter out scopes that don't meet the required
 * criteria.
 *
 * @param initialPosition
 * @param direction
 * @param requirements
 * @param previousScope
 * @param scope
 * @returns `true` if {@link scope} meets the criteria laid out in
 * {@link requirements}, as well as the default semantics.
 */
export function shouldYieldScope(
  initialPosition: Position,
  currentPosition: Position,
  direction: Direction,
  requirements: ScopeIteratorRequirements,
  previousScope: TargetScope | undefined,
  scope: TargetScope,
): boolean {
  return (
    checkRequirements(initialPosition, requirements, scope) &&
    checkCurrentProgress(
      requirements,
      currentPosition,
      direction,
      previousScope,
      scope,
    )
  );
}

function checkRequirements(
  position: Position,
  requirements: ScopeIteratorRequirements,
  scope: TargetScope,
): boolean {
  const { containment, distalPosition, allowAdjacentScopes } = requirements;
  const { domain } = scope;

  // Simple containment checks
  switch (containment) {
    case "disallowed":
      if (domain.contains(position)) {
        return false;
      }
      break;
    case "disallowedIfStrict":
      if (strictlyContains(domain, position)) {
        return false;
      }
      break;
    case "required":
      if (!domain.contains(position)) {
        return false;
      }
      break;
  }

  return intersects(
    new Range(position, distalPosition),
    domain,
    allowAdjacentScopes,
  );
}

function checkCurrentProgress(
  requirements: ScopeIteratorRequirements,
  currentPosition: Position,
  direction: Direction,
  previousScope: TargetScope | undefined,
  scope: TargetScope,
): boolean {
  const { excludeNestedScopes } = requirements;
  const { domain } = scope;

  if (
    previousScope != null &&
    compareTargetScopes(direction, currentPosition, previousScope, scope) >= 0
  ) {
    // Don't yield any scopes that are considered prior to a scope that has
    // already been yielded
    return false;
  }

  // Don't yield scopes that end before the iteration is supposed to start
  if (
    direction === "forward"
      ? domain.end.isBefore(currentPosition)
      : domain.start.isAfter(currentPosition)
  ) {
    return false;
  }

  if (
    excludeNestedScopes &&
    previousScope != null &&
    scope.domain.contains(previousScope.domain)
  ) {
    return false;
  }

  return true;
}

/**
 * Returns `true` if the ranges intersect.  If `allowEmpty` is `false`, then the
 * intersection must be nonempty unless `range2` empty.
 *
 * @param range1 A range
 * @param range2 Another range
 * @param allowAdjacent If `true`, then empty intersections are allowed.  If
 * `false`, then empty intersections are only allowed if one of the ranges is
 * empty
 * @returns `true` if the intersection of the ranges is nonempty
 */
function intersects(
  range1: Range,
  range2: Range,
  allowAdjacent: boolean,
): boolean {
  const intersection = range1.intersection(range2);

  if (intersection == null) {
    return false;
  }

  return !intersection.isEmpty || allowAdjacent || range2.isEmpty;
}
