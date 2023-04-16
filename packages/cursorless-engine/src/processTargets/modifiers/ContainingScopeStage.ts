import type { ContainingScopeModifier, Direction } from "@cursorless/common";
import {
  NoContainingScopeError,
  Position,
  TextEditor,
} from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getContainingScope } from "./getContainingScope";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * This modifier stage expands from the input target to the smallest containing
 * scope.  We proceed as follows:
 *
 * 1. Expand to smallest scope(s) touching start position of input target's
 *    content range
 * 2. If input target has an empty content range, return the start scope,
 *    breaking ties as defined by {@link ScopeHandler.isPreferredOver} when more
 *    than one scope touches content range
 * 3. Otherwise, if end of input target is weakly contained by the domain of the
 *    rightmost start scope, return rightmost start scope.  We return rightmost
 *    because that will have non-empty intersection with input target content
 *    range.
 * 4. Otherwise, expand from end of input target and form a range from rightmost
 *    start scope through leftmost end scope.  We use rightmost start scope and
 *    leftmost end scope because those will have non-empty intersection with
 *    input target content range.
 */
export class ContainingScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: ContainingScopeModifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const {
      isReversed,
      editor,
      contentRange: { start, end },
    } = target;
    const { scopeType, ancestorIndex = 0 } = this.modifier;

    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return this.modifierStageFactory
        .getLegacyScopeStage(this.modifier)
        .run(context, target);
    }

    if (end.isEqual(start)) {
      // Input target is empty; return the preferred scope touching target
      let scope = getPreferredScopeTouchingPosition(
        scopeHandler,
        editor,
        start,
      );

      if (scope == null) {
        throw new NoContainingScopeError(this.modifier.scopeType.type);
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
        throw new NoContainingScopeError(this.modifier.scopeType.type);
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
      throw new NoContainingScopeError(this.modifier.scopeType.type);
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
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return [constructScopeRangeTarget(isReversed, startScope, endScope)];
  }
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
