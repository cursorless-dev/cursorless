import type { Direction, RelativeScopeModifier } from "@cursorless/common";
import { NoContainingScopeError, Range, TextEditor } from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { TooFewScopesError } from "./TooFewScopesError";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getContainingScope } from "./getContainingScope";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import getScopeRelativeToPosition from "./scopeHandlers/getScopeRelativeToPosition";
import getScopesOverlappingRange from "./scopeHandlers/getScopesOverlappingRange";
import type { TargetScope } from "./scopeHandlers/scope.types";
import type { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

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

    const { isReversed, editor, contentRange: inputRange } = target;
    const { scopeType, length: desiredScopeCount, direction } = this.modifier;

    // FIXME: Figure out how to just continue iteration rather than starting
    // over after getting offset 0 scopes
    const offset0Scopes = getOffset0Scopes(
      scopeHandler,
      direction,
      editor,
      inputRange,
    );

    const offset0ScopeCount = offset0Scopes.length;

    if (offset0ScopeCount === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    if (offset0ScopeCount > desiredScopeCount) {
      throw new TooFewScopesError(
        desiredScopeCount,
        offset0ScopeCount,
        scopeType.type,
      );
    }

    const proximalScope =
      direction === "forward" ? offset0Scopes[0] : offset0Scopes.at(-1)!;

    const initialPosition =
      direction === "forward"
        ? offset0Scopes.at(-1)!.domain.end
        : offset0Scopes[0].domain.start;

    const distalScope =
      desiredScopeCount > offset0ScopeCount
        ? getScopeRelativeToPosition(
            scopeHandler,
            editor,
            initialPosition,
            desiredScopeCount - offset0ScopeCount,
            direction,
          )
        : direction === "forward"
        ? offset0Scopes.at(-1)!
        : offset0Scopes[0];

    return [constructScopeRangeTarget(isReversed, proximalScope, distalScope)];
  }
}

/**
 * Returns a list of scopes that are considered to be at relative scope offset
 * 0, ie "containing" / "intersecting" with the input target.  If the input
 * target is zero length, we return at most one scope, breaking ties by moving
 * in {@link direction} if the input position is adjacent to two scopes.
 * @param scopeHandler The scope handler for the given scope type
 * @param direction The direction defined by the modifier
 * @param editor The editor containing {@link range}
 * @param range The input target range
 * @returns The scopes that are considered to be at offset 0, ie "containing" /
 * "intersecting" with the input target
 */
function getOffset0Scopes(
  scopeHandler: ScopeHandler,
  direction: Direction,
  editor: TextEditor,
  range: Range,
): TargetScope[] {
  if (range.isEmpty) {
    // First try scope in correct direction, falling back to opposite direction
    const containingScope =
      getContainingScope(scopeHandler, editor, range.start, direction) ??
      getContainingScope(
        scopeHandler,
        editor,
        range.start,
        direction === "forward" ? "backward" : "forward",
      );

    return containingScope == null ? [] : [containingScope];
  }

  return getScopesOverlappingRange(scopeHandler, editor, range);
}
