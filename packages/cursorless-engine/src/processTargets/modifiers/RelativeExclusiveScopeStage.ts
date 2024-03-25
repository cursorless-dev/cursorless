import type { RelativeScopeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import type { ContainmentPolicy } from "./scopeHandlers/scopeHandler.types";
import { islice } from "itertools";
import { scopesToTargets } from "./scopesToTargets";

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds by running
 * {@link ScopeHandler.generateScopes} to get the desired scopes, skipping the
 * first scope if input range is empty and is at start of that scope.
 */
export class RelativeExclusiveScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: RelativeScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return runLegacy(this.modifierStageFactory, this.modifier, target);
    }

    const { editor, contentRange: inputRange } = target;
    const { length: desiredScopeCount, direction, offset } = this.modifier;

    const initialPosition =
      direction === "forward" ? inputRange.end : inputRange.start;

    // If inputRange is empty, then we skip past any scopes that start at
    // inputRange.  Otherwise just disallow any scopes that start strictly
    // before the end of input range (strictly after for "backward").
    const containment: ContainmentPolicy | undefined = inputRange.isEmpty
      ? "disallowed"
      : "disallowedIfStrict";

    const iter = islice(
      scopeHandler.generateScopes(editor, initialPosition, direction, {
        containment,
        skipAncestorScopes: true,
      }),
      offset - 1,
      offset + desiredScopeCount - 1,
    );

    return scopesToTargets(
      iter,
      this.modifier.length,
      this.modifier.isEvery ?? false,
      target.isReversed,
    );
  }
}
