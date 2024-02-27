import {
  NoContainingScopeError,
  RelativeScopeModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import {
  constructScopeRangeTarget,
  constructTargetsFromScopes,
} from "./constructScopeRangeTarget";
import { getPreferredScopeTouchingPosition } from "./getPreferredScopeTouchingPosition";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { itake } from "itertools";
import { OutOfRangeError } from "./targetSequenceUtils";
/**
 * Handles relative modifiers that include targets intersecting with the input,
 * eg `"two funks"`, `"token backward"`, etc.  Proceeds as follows:
 *
 * 1. Constructs the initial range to use as the starting point for the relative
 *    scope search.  Expands from the proximal end of the input target (start
 *    for "forward", end for "backward") to the smallest containing scope,
 *    breaking ties in direction {@link direction} rather than the tie-breaking
 *    heuristics we use for containing scope, to make this modifier easier to
 *    reason about when between scopes.
 * 2. Calls {@link ScopeHandler.generateScopes} to get as many scopes as
 *    desired, starting from the proximal end of the initial range (ie the start
 *    if direction is "forward", the end if direction is "backward").
 */
export class RelativeInclusiveScopeStage implements ModifierStage {
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

    const { isReversed, editor, contentRange } = target;
    const { length: desiredScopeCount, direction } = this.modifier;

    const initialRange = getPreferredScopeTouchingPosition(
      scopeHandler,
      editor,
      direction === "forward" ? contentRange.start : contentRange.end,
      direction,
    )?.domain;

    if (initialRange == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    const scopes = Array.from(
      itake(
        desiredScopeCount,
        scopeHandler.generateScopes(
          editor,
          direction === "forward" ? initialRange.start : initialRange.end,
          direction,
          {
            skipAncestorScopes: true,
          },
        ),
      ),
    );

    if (scopes.length < desiredScopeCount) {
      throw new OutOfRangeError();
    }

    if (this.modifier.isEvery) {
      return constructTargetsFromScopes(isReversed, scopes);
    }

    return constructScopeRangeTarget(
      isReversed,
      scopes[0],
      scopes[scopes.length - 1],
    );
  }
}
