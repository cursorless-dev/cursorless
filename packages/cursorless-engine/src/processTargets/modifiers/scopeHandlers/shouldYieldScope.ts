import { Position } from "@cursorless/common";
import { Direction } from "@cursorless/common";
import { strictlyContains } from "../../../util/rangeUtils";
import { compareTargetScopes } from "./compareTargetScopes";
import { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

/**
 * This function is used to filter out scopes that don't meet the required
 * criteria.
 *
 * @param position
 * @param direction
 * @param hints
 * @param previousScope
 * @param scope
 * @returns `true` if {@link scope} meets the criteria laid out in
 * {@link hints}, as well as the default semantics.
 */
export function shouldYieldScope(
  position: Position,
  direction: Direction,
  hints: ScopeIteratorRequirements,
  previousScope: TargetScope | undefined,
  scope: TargetScope,
): boolean {
  const { containment, distalPosition } = hints;
  const { domain } = scope;

  if (
    previousScope != null &&
    compareTargetScopes(direction, position, previousScope, scope) >= 0
  ) {
    // Don't yield any scopes that are considered prior to a scope that has
    // already been yielded
    return false;
  }

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

  // Don't yield scopes that end before the iteration is supposed to start
  if (
    direction === "forward"
      ? domain.end.isBefore(position)
      : domain.start.isAfter(position)
  ) {
    return false;
  }

  // Don't return non-empty scopes that end where the iteration is supposed to
  // start
  if (
    !domain.isEmpty &&
    (direction === "forward"
      ? domain.end.isEqual(position)
      : domain.start.isEqual(position))
  ) {
    return false;
  }

  if (distalPosition != null) {
    if (
      direction === "forward"
        ? domain.start.isAfter(distalPosition)
        : domain.end.isBefore(distalPosition)
    ) {
      // If a distalPosition was given, don't yield scopes that start after the
      // distalPosition
      return false;
    }

    if (
      !domain.isEmpty &&
      (direction === "forward"
        ? domain.start.isEqual(distalPosition)
        : domain.end.isEqual(distalPosition))
    ) {
      // If a distalPosition was given, don't yield non-empty scopes that start
      // at distalPosition
      return false;
    }
  }

  return true;
}
