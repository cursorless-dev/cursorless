import {
  NoContainingScopeError,
  RelativeScopeModifier,
} from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getPreferredScopeTouchingPosition } from "./getPreferredScopeTouchingPosition";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import getScopeRelativeToPosition from "./scopeHandlers/getScopeRelativeToPosition";
import { itake } from "itertools";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";
/**
 * Handles relative modifiers that include targets intersecting with the input,
 * eg `"two funks"`, `"token backward"`, etc.  Proceeds as follows:
 *
 * 1. Gets all scopes intersecting with input target.  For empty range, that
 *    will be the scope touching the input, preferring the one in the direction
 *    of {@link RelativeScopeModifier.direction} if the input is adjacent to
 *    two. For non-empty range, just queries
 *    {@link ScopeHandler.getScopesOverlappingRange}.  These are called the
 *    offset 0 scopes, as they correspond to "offset 0".
 * 2. Subtracts the number of scopes at offset 0 from
 *    {@link RelativeScopeModifier.length} to determine how many more are
 *    needed, throwing an error if offset zero already has more scopes than
 *    needed.
 * 3. Calls {@link ScopeHandler.getScopeRelativeToPosition} starting from the
 *    end of the last offset 0 scope if direction is forward (start of the first
 *    if direction is backward). Uses `offset` determined from subtraction above
 *    to get enough scopes to result in {@link RelativeScopeModifier.length}
 *    total scopes.
 * 4. Constructs a range target from the first offset 0 scope past the newly
 *    returned scope if direction is forward, or from last offset 0 scope if
 *    direction is backward.
 */
export class RelativeInclusiveScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: RelativeScopeModifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return runLegacy(
        this.modifierStageFactory,
        this.modifier,
        context,
        target,
      );
    }

    return target.contentRange.isEmpty
      ? handleEmptyInput(scopeHandler, target, this.modifier)
      : handleNonemptyInput(scopeHandler, target, this.modifier);
  }
}

function handleEmptyInput(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
) {
  const { isReversed, editor, contentRange: inputRange } = target;
  const { scopeType, length: desiredScopeCount, direction } = modifier;

  // FIXME: Figure out how to just continue iteration rather than starting
  // over after getting offset 0 scopes
  const offset0Scope = getPreferredScopeTouchingPosition(
    scopeHandler,
    editor,
    inputRange.start,
    direction,
  );

  if (offset0Scope == null) {
    throw new NoContainingScopeError(scopeType.type);
  }

  if (desiredScopeCount === 1) {
    return [offset0Scope.getTarget(isReversed)];
  }

  const distalScope = getScopeRelativeToPosition(
    scopeHandler,
    editor,
    direction === "forward"
      ? offset0Scope.domain.end
      : offset0Scope.domain.start,
    desiredScopeCount - 1,
    direction,
  );

  return [constructScopeRangeTarget(isReversed, offset0Scope, distalScope)];
}

function handleNonemptyInput(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
) {
  const { isReversed, editor, contentRange: inputRange } = target;
  const { length: desiredScopeCount, direction } = modifier;

  const scopes = Array.from(
    itake(
      desiredScopeCount,
      scopeHandler.generateScopes(
        editor,
        direction === "forward" ? inputRange.start : inputRange.end,
        direction,
        {
          excludeNestedScopes: true,
        },
      ),
    ),
  );

  if (scopes.length < desiredScopeCount) {
    throw new OutOfRangeError();
  }

  return scopes.length === 1
    ? [scopes[0].getTarget(isReversed)]
    : [
        constructScopeRangeTarget(
          isReversed,
          scopes[0],
          scopes[scopes.length - 1],
        ),
      ];
}
