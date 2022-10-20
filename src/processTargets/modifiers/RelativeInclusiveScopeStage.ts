import type { Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type {
  Direction,
  RelativeScopeModifier,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getLeftScope, getRightScope } from "./getPreferredScope";
import { runLegacy } from "./relativeScopeLegacy";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { TargetScope } from "./scopeHandlers/scope.types";
import type { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { TooFewScopesError } from "./TooFewScopesError";

export class RelativeInclusiveScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const scopeHandler = getScopeHandler(
      this.modifier.scopeType,
      target.editor.document.languageId
    );

    if (scopeHandler == null) {
      return runLegacy(this.modifier, context, target);
    }

    const { isReversed, editor, contentRange: inputRange } = target;
    const { scopeType, length: desiredScopeCount, direction } = this.modifier;

    const index0Scopes = getIndex0Scopes(
      scopeHandler,
      direction,
      editor,
      inputRange
    );

    const index0ScopeCount = index0Scopes.length;

    if (index0ScopeCount === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    if (index0ScopeCount > desiredScopeCount) {
      throw new TooFewScopesError(
        desiredScopeCount,
        index0ScopeCount,
        scopeType.type
      );
    }

    const proximalScope =
      direction === "forward" ? index0Scopes[0] : index0Scopes.at(-1)!;

    const initialPosition =
      direction === "forward"
        ? index0Scopes.at(-1)!.domain.end
        : index0Scopes[0].domain.start;

    const distalScope =
      desiredScopeCount > index0ScopeCount
        ? scopeHandler.getScopeRelativeToPosition(
            editor,
            initialPosition,
            desiredScopeCount - index0ScopeCount,
            direction
          )
        : direction === "forward"
        ? index0Scopes.at(-1)!
        : index0Scopes[0];

    return [constructScopeRangeTarget(isReversed, proximalScope, distalScope)];
  }
}

/**
 * Returns a list of scopes that are considered to be at relative scope index
 * 0, ie "containing" / "intersecting" with the input target.  If the input
 * target is zero length, we return at most one scope, breaking ties by moving
 * in {@link direction} if the input position is adjacent to two scopes.
 * @param scopeHandler The scope handler for the given scope type
 * @param direction The direction defined by the modifier
 * @param editor The editor containing {@link range}
 * @param range The input target range
 * @returns The scopes that are considered to be at index 0, ie "containing" / "intersecting" with the input target
 */
function getIndex0Scopes(
  scopeHandler: ScopeHandler,
  direction: Direction,
  editor: TextEditor,
  range: Range
): TargetScope[] {
  if (range.isEmpty) {
    const inputPosition = range.start;

    const scopesTouchingPosition = scopeHandler.getScopesTouchingPosition(
      editor,
      inputPosition
    );

    const preferredScope =
      direction === "forward"
        ? getRightScope(scopesTouchingPosition)
        : getLeftScope(scopesTouchingPosition);

    return preferredScope == null ? [] : [preferredScope];
  }

  return scopeHandler.getScopesOverlappingRange(editor, range);
}
