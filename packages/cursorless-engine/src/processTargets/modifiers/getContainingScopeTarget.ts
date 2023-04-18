import {
  Direction,
  NoContainingScopeError,
  Position,
  TextEditor,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getContainingScope } from "./getContainingScope";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

export function getContainingScopeTarget(
  target: Target,
  scopeHandler: ScopeHandler,
  errorName: string,
  ancestorIndex: number = 0,
) {
  const {
    isReversed,
    editor,
    contentRange: { start, end },
  } = target;

  if (end.isEqual(start)) {
    // Input target is empty; return the preferred scope touching target
    let scope = getPreferredScopeTouchingPosition(scopeHandler, editor, start);

    if (scope == null) {
      throw new NoContainingScopeError(errorName);
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
      throw new NoContainingScopeError(errorName);
    }

    return [scope.getTarget(isReversed)];
  }

  const startScope = expandFromPosition(
    scopeHandler,
    editor,
    start,
    "forward",
    ancestorIndex,
  );

  if (startScope == null) {
    throw new NoContainingScopeError(errorName);
  }

  if (startScope.domain.contains(end)) {
    return [startScope.getTarget(isReversed)];
  }

  const endScope = expandFromPosition(
    scopeHandler,
    editor,
    end,
    "backward",
    ancestorIndex,
  );

  if (endScope == null) {
    throw new NoContainingScopeError(errorName);
  }

  return [constructScopeRangeTarget(isReversed, startScope, endScope)];
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
