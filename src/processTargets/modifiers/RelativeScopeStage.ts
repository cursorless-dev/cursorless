import { Position, Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../errors";
import { Target } from "../../typings/target.types";
import { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getPreferredScope } from "./getPreferredScope";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandler, TargetScope } from "./scopeHandlers/scopeHandler.types";
import { TooFewScopesError } from "./TooFewScopesError";

export class RelativeScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.scopeType.type) {
      case "token":
        return this.runNew(target);
      default:
        return runLegacy(this.modifier, context, target);
    }
  }

  private runNew(target: Target): Target[] {
    return this.modifier.offset === 0
      ? this.handleIncludingIntersecting(target)
      : this.handleNotIncludingIntersecting(target);
  }

  private handleNotIncludingIntersecting(target: Target): Target[] {
    const { isReversed, editor, contentRange: range } = target;
    const { scopeType, length, direction, offset } = this.modifier;

    const scopeHandler = getScopeHandler(scopeType);

    const index0Scopes = getIndex0Scopes(scopeHandler, editor, range);

    const proximalScope = scopeHandler.getScopeRelativeToPosition(
      editor,
      getIndex0DistalPosition(direction, index0Scopes),
      offset,
      direction
    );

    if (length === 1) {
      return [proximalScope.getTarget(isReversed)];
    }

    const distalScope = scopeHandler.getScopeRelativeToPosition(
      editor,
      direction === "forward"
        ? proximalScope.domain.end
        : proximalScope.domain.start,
      length - 1,
      direction
    );

    return constructScopeRangeTarget(isReversed, proximalScope, distalScope);
  }

  private handleIncludingIntersecting(target: Target): Target[] {
    const { isReversed, editor, contentRange: range } = target;
    const { scopeType, length: desiredScopeCount, direction } = this.modifier;

    const scopeHandler = getScopeHandler(scopeType);

    const index0Scopes = getIndex0Scopes(scopeHandler, editor, range);

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

    const distalScope =
      desiredScopeCount > index0ScopeCount
        ? scopeHandler.getScopeRelativeToPosition(
            editor,
            getIndex0DistalPosition(direction, index0Scopes),
            desiredScopeCount - index0ScopeCount,
            direction
          )
        : direction === "forward"
        ? index0Scopes.at(-1)!
        : index0Scopes[0];

    return constructScopeRangeTarget(isReversed, proximalScope, distalScope);
  }
}

/**
 * Returns a position that should be considered the reference position when
 * finding scopes beyond index 0.
 * @param direction Which direction we're going relative, eg "forward" or "backward"
 * @param index0Scopes The index 0 scopes, as defined by {@link getIndex0Scopes}
 * @returns The position from which indices greater than 0 should be defined
 */
function getIndex0DistalPosition(
  direction: string,
  index0Scopes: TargetScope[]
): Position {
  return direction === "forward"
    ? index0Scopes.at(-1)!.domain.end
    : index0Scopes[0].domain.start;
}

/**
 * Returns a list of scopes that are considered to be at relative scope index
 * 0, ie "containing" / "intersecting" with the input target.  If the input
 * target is zero length, we return the containing scope, otherwise we return
 * the intersecting scopes.
 * @param scopeHandler The scope handler for the given scope type
 * @param editor The editor containing {@link range}
 * @param range The input target range
 * @returns The scopes that are considered to be at index 0, ie "containing" / "intersecting" with the input target
 */
function getIndex0Scopes(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  range: Range
): TargetScope[] {
  return range.isEmpty
    ? [
        getPreferredScope(
          scopeHandler.getScopesContainingPosition(editor, range.start)
        ),
      ]
    : scopeHandler.getScopesIntersectingRange(editor, range);
}
