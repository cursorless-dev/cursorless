import { Position, Range } from "@cursorless/common";
import { Direction } from "@cursorless/common";
import { strictlyContains } from "../../../util/rangeUtils";
import { compareTargetScopes } from "./compareTargetScopes";
import { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

/**
 * Returns `true` if the scope should be yielded.  Checks that the scope meets
 * {@link requirements} and that it is not considered prior to the previously
 * yielded scope as determined by {@link compareTargetScopes} if we were to
 * start at {@link currentPosition} and iterate in {@link direction}.
 *
 * @param initialPosition The position at which the scope iteration started
 * @param currentPosition The distal position of the most recently yielded scope
 * @param direction The direction of iteration
 * @param requirements The requirements for yielding a scope
 * @param previousScope The most recently yielded scope
 * @param scope The scope to check
 * @returns `true` if the scope should be yielded
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
    checkRequirements(initialPosition, requirements, previousScope, scope) &&
    // Note that we're using `currentPosition` instead of `initialPosition`
    // below, because we want to filter out scopes that are strictly contained
    // by previous scopes.  However, if we want to include descendant scopes,
    // then we do use the initial position
    (previousScope == null ||
      compareTargetScopes(
        direction,
        requirements.includeDescendantScopes
          ? initialPosition
          : currentPosition,
        previousScope,
        scope,
      ) < 0)
  );
}

function checkRequirements(
  position: Position,
  requirements: ScopeIteratorRequirements,
  previousScope: TargetScope | undefined,
  scope: TargetScope,
): boolean {
  const {
    containment,
    distalPosition,
    allowAdjacentScopes,
    skipAncestorScopes,
  } = requirements;
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

  if (
    skipAncestorScopes &&
    previousScope != null &&
    domain.contains(previousScope.domain)
  ) {
    return false;
  }

  return partiallyContains(
    new Range(position, distalPosition),
    domain,
    allowAdjacentScopes,
  );
}

/**
 * Returns `true` if {@link range1} at least partially contains {@link range2}.
 * If {@link allowAdjacent} is `false`, then the intersection must be nonempty
 * unless {@link range2} is empty.
 *
 * @param range1 A range
 * @param range2 Another range
 * @param allowAdjacent If `true`, then empty intersections are allowed.  If
 * `false`, then empty intersections are only allowed if {@link range2} is empty
 * @returns `true` if {@link range1} at least partially contains {@link range2}.
 */
function partiallyContains(
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
