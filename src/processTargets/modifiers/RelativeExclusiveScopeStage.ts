import type { Position, TextEditor } from "vscode";
import type { Target } from "../../typings/target.types";
import type { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getLeftScope, getRightScope } from "./getPreferredScope";
import { runLegacy } from "./relativeScopeLegacy";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds as follows:
 *
 * 1. If the input is empty, skips past any scopes that are directly adjacent to
 *    input target in the direction of movement.  Eg if the cursor is at the
 *    very start of a token, we first jump past that token for "next token".
 * 2. Otherwise, we start at the `end` of the input range (`start` if
 *    {@link RelativeScopeModifier.direction} is `"backward"`).
 * 3. Asks the scope handler for the scope at
 *    {@link RelativeScopeModifier.offset} in given
 *    {@link RelativeScopeModifier.direction} by calling
 *    {@link ScopeHandler.getScopeRelativeToPosition}.
 * 4. If {@link RelativeScopeModifier.length} is 1, returns that scope
 * 5. Otherwise, asks scope handler for scope at offset
 *    {@link RelativeScopeModifier.length} - 1, starting from the end of
 *    {@link Scope.domain} of that scope, and forms a range target.
 */
export default class RelativeExclusiveScopeStage implements ModifierStage {
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
    const { length: desiredScopeCount, direction, offset } = this.modifier;

    const initialPosition = inputRange.isEmpty
      ? getInitialPositionForEmptyInputRange(
          scopeHandler,
          direction,
          editor,
          inputRange.start
        )
      : direction === "forward"
      ? inputRange.end
      : inputRange.start;

    const proximalScope = scopeHandler.getScopeRelativeToPosition(
      editor,
      initialPosition,
      offset,
      direction
    );

    if (desiredScopeCount === 1) {
      return [proximalScope.getTarget(isReversed)];
    }

    const distalScope = scopeHandler.getScopeRelativeToPosition(
      editor,
      direction === "forward"
        ? proximalScope.domain.end
        : proximalScope.domain.start,
      desiredScopeCount - 1,
      direction
    );

    return [constructScopeRangeTarget(isReversed, proximalScope, distalScope)];
  }
}

/**
 * Determines the position to pass in to
 * {@link ScopeHandler.getScopeRelativeToPosition}.  If input target is empty,
 * we skip past one scope if it is direclty adjacent to us in the direction
 * we're going.  Otherwise we just use end or start of input target,
 * depending which direction we're going (`end` for `"forward"`).
 * @param scopeHandler The scope handler to ask
 * @param direction The direction we are going
 * @param editor The editor containing {@link inputPosition}
 * @param inputPosition The position of the input target
 * @returns
 */
function getInitialPositionForEmptyInputRange(
  scopeHandler: ScopeHandler,
  direction: string,
  editor: TextEditor,
  inputPosition: Position
) {
  const scopesTouchingPosition = scopeHandler.getScopesTouchingPosition(
    editor,
    inputPosition
  );

  const skipScope =
    direction === "forward"
      ? getRightScope(scopesTouchingPosition)
      : getLeftScope(scopesTouchingPosition);

  return (
    (direction === "forward"
      ? skipScope?.domain.end
      : skipScope?.domain.start) ?? inputPosition
  );
}
