import { Direction, Position, TextEditor } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getContainingScope } from "./getContainingScope";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * Finds the containing scope of the target for the given scope handler
 *
 * @param target The target to find the containing scope of
 * @param scopeHandler The scope handler for the scope type to find containing scope of
 * @param ancestorIndex How many ancestors to go up. 0 means the immediate containing scope
 * @returns A target representing the containing scope, or undefined if no containing scope found
 */
export function getContainingScopeTarget(
  target: Target,
  scopeHandler: ScopeHandler,
  ancestorIndex: number = 0,
): Target | undefined {
  const {
    isReversed,
    editor,
    contentRange: { start, end },
  } = target;

  if (end.isEqual(start)) {
    // Input target is empty; return the preferred scope touching target
    let scope = getPreferredScopeTouchingPosition(scopeHandler, editor, start);

    if (scope == null) {
      return undefined;
    }

    if (ancestorIndex > 0) {
      scope = expandFromPosition(
        scopeHandler,
        editor,
        scope.domain.end,
        "forward",
        ancestorIndex - 1,
      );
    }

    if (scope == null) {
      return undefined;
    }

    return scope.getTarget(isReversed);
  }

  const startScope = expandFromPosition(
    scopeHandler,
    editor,
    start,
    "forward",
    ancestorIndex,
  );

  if (startScope == null) {
    return undefined;
  }

  if (startScope.domain.contains(end)) {
    return startScope.getTarget(isReversed);
  }

  const endScope = expandFromPosition(
    scopeHandler,
    editor,
    end,
    "backward",
    ancestorIndex,
  );

  if (endScope == null) {
    return undefined;
  }

  return constructScopeRangeTarget(isReversed, startScope, endScope);
}

function expandFromPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
  ancestorIndex: number,
): TargetScope | undefined {
  let nextAncestorIndex = 0;
  for (const scope of scopeHandler.generateScopes(editor, position, direction, {
    containment: "required",
  })) {
    if (nextAncestorIndex === ancestorIndex) {
      return scope;
    }

    // Because containment is required, and we are moving in a consistent
    // direction (ie forward or backward), each scope will be progressively
    // larger
    nextAncestorIndex += 1;
  }

  return undefined;
}

function getPreferredScopeTouchingPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
): TargetScope | undefined {
  const forwardScope = getContainingScope(
    scopeHandler,
    editor,
    position,
    "forward",
  );

  if (forwardScope == null) {
    return getContainingScope(scopeHandler, editor, position, "backward");
  }

  if (
    scopeHandler.isPreferredOver == null ||
    forwardScope.domain.start.isBefore(position)
  ) {
    return forwardScope;
  }

  const backwardScope = getContainingScope(
    scopeHandler,
    editor,
    position,
    "backward",
  );

  // If there is no backward scope, or if the backward scope is an ancestor of
  // forward scope, return forward scope
  if (
    backwardScope == null ||
    backwardScope.domain.contains(forwardScope.domain)
  ) {
    return forwardScope;
  }

  return scopeHandler.isPreferredOver(backwardScope, forwardScope) ?? false
    ? backwardScope
    : forwardScope;
}
