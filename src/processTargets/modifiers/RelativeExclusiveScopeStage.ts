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
