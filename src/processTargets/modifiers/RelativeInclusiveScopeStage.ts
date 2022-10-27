import type { Target } from "../../typings/target.types";
import type { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { runLegacy } from "./relativeScopeLegacy";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { TargetScope } from "./scopeHandlers/scope.types";
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
    const { length: desiredScopeCount, direction } = this.modifier;

    const initialPosition =
      direction === "forward" ? inputRange.start : inputRange.end;

    let scopeCount = 0;
    let proximalScope: TargetScope | undefined;
    for (const scope of scopeHandler.generateScopesRelativeToPosition(
      editor,
      initialPosition,
      direction,
    )) {
      if (scopeCount > 0 && scope.domain.contains(initialPosition)) {
        continue;
      }

      scopeCount += 1;

      if (scopeCount === 1) {
        if (desiredScopeCount === 1) {
          return [scope.getTarget(isReversed)];
        }

        proximalScope = scope;
        continue;
      }

      if (scopeCount === desiredScopeCount) {
        return [constructScopeRangeTarget(isReversed, proximalScope!, scope)];
      }
    }

    throw new OutOfRangeError();
  }
}
