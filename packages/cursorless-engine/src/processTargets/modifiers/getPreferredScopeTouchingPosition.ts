import { Direction, Position, TextEditor } from "@cursorless/common";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { strictlyContains } from "../../util/rangeUtils";

/**
 * Returns the preferred scope touching the input position, or undefined if no
 * scope touches the input position.  If the input position is between two
 * adjacent scopes, we prefer the scope in {@link forceDirection} if defined,
 * otherwise we prefer the scope that {@link ScopeHandler.isPreferredOver} says
 * is preferred.  If neither of these are defined, we prefer the scope in the
 * forward direction.
 *
 * Note that a scope is considered to be "touching" {@link position} even if its
 * domain strictly contains {@link position}.
 *
 * This function is designed to be used to find the scope that contains an empty
 * input target.
 *
 * @param scopeHandler The scope handler for the given scope type
 * @param editor The editor containing {@link position}
 * @param position The input position
 * @param forceDirection If defined, and position is between two adjacent
 * scopes, prefer the scope in this direction
 * @returns The preferred scope touching the input position, or undefined if no
 * scope touches the input position
 */
export function getPreferredScopeTouchingPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  forceDirection?: Direction,
): TargetScope | undefined {
  const iterable = scopeHandler.generateScopes(editor, position, "forward", {
    containment: "required",
    allowAdjacentScopes: true,
  });

  const candidates: TargetScope[] = [];
  for (const scope of iterable) {
    if (
      !candidates.some((candidate) => scope.domain.contains(candidate.domain))
    ) {
      // We're only looking for minimal scopes
      candidates.push(scope);
    }

    if (strictlyContains(scope.domain, position)) {
      // If we've found a scope that strictly contains position,
      // then we're not going to find any more minimal scopes
      break;
    }
  }

  switch (candidates.length) {
    case 0:
      return undefined;
    case 1:
      return candidates[0];
    case 2: {
      const [backwardScope, forwardScope] = candidates;
      return forceDirection === "forward"
        ? forwardScope
        : forceDirection === "backward"
        ? backwardScope
        : scopeHandler.isPreferredOver == null
        ? forwardScope
        : scopeHandler.isPreferredOver(backwardScope, forwardScope) ?? false
        ? backwardScope
        : forwardScope;
    }
    default:
      // This should never happen
      throw new Error("Expected no more than 2 scope candidates");
  }
}
