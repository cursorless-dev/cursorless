import type { Target } from "../../typings/target.types";
import type { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import { strictlyContains } from "../../util/rangeUtils";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { runLegacy } from "./relativeScopeLegacy";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import { TargetScope } from "./scopeHandlers/scope.types";
import type { ContainmentPolicy } from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";

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
 *    {@link Scope.domain} of that scope (start for "backward"), and forms a
 *    range target.
 */
export default class RelativeExclusiveScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const scopeHandler = getScopeHandler(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return runLegacy(this.modifier, context, target);
    }

    const { isReversed, editor, contentRange: inputRange } = target;
    const { length: desiredScopeCount, direction, offset } = this.modifier;

    const initialPosition =
      direction === "forward" ? inputRange.end : inputRange.start;

    const containment: ContainmentPolicy | undefined = inputRange.isEmpty
      ? "disallowed"
      : "disallowedStrict";

    let scopeCount = 0;
    let proximalScope: TargetScope | undefined;
    for (const scope of scopeHandler.generateScopesRelativeToPosition(
      editor,
      initialPosition,
      direction,
      { containment },
    )) {
      if (
        (containment === "disallowed" &&
          scope.domain.contains(initialPosition)) ||
        strictlyContains(scope.domain, initialPosition)
      ) {
        continue;
      }

      scopeCount += 1;

      if (scopeCount < offset) {
        continue;
      }

      if (scopeCount === offset) {
        if (desiredScopeCount === 1) {
          return [scope.getTarget(isReversed)];
        }

        proximalScope = scope;
        continue;
      }

      if (scopeCount === offset + desiredScopeCount - 1) {
        return [constructScopeRangeTarget(isReversed, proximalScope!, scope)];
      }
    }

    throw new OutOfRangeError();
  }
}
