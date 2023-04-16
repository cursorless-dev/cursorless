import type { RelativeScopeModifier } from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { TargetScope } from "./scopeHandlers/scope.types";
import type { ContainmentPolicy } from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds by running
 * {@link ScopeHandler.generateScopes} to get the desired scopes, skipping the
 * first scope if input range is empty and is at start of that scope.
 */
export default class RelativeExclusiveScopeStage implements ModifierStage {
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
    const { length: desiredScopeCount, direction, offset } = this.modifier;

    const initialPosition =
      direction === "forward" ? inputRange.end : inputRange.start;

    // If inputRange is empty, then we skip past any scopes that start at
    // inputRange.  Otherwise just disallow any scopes that start strictly
    // before the end of input range (strictly after for "backward").
    const containment: ContainmentPolicy | undefined = inputRange.isEmpty
      ? "disallowed"
      : "disallowedIfStrict";

    let scopeCount = 0;
    let proximalScope: TargetScope | undefined;
    for (const scope of scopeHandler.generateScopes(
      editor,
      initialPosition,
      direction,
      { containment },
    )) {
      scopeCount += 1;

      if (scopeCount < offset) {
        // Skip until we hit `offset`
        continue;
      }

      if (scopeCount === offset) {
        // When we hit offset, that becomes proximal scope
        if (desiredScopeCount === 1) {
          // Just yield it if we only want 1 scope
          return [scope.getTarget(isReversed)];
        }

        proximalScope = scope;
        continue;
      }

      if (scopeCount === offset + desiredScopeCount - 1) {
        // Then make a range when we get the desired number of scopes
        return [constructScopeRangeTarget(isReversed, proximalScope!, scope)];
      }
    }

    throw new OutOfRangeError();
  }
}
