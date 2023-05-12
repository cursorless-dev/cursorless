import {
  NoContainingScopeError,
  RelativeScopeModifier,
} from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
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
 *    scope search.  If the input range is empty, then we use the preferred
 *    scope touching the input position.  Otherwise, we use the input range
 *    itself.
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

    const { isReversed, editor, contentRange } = target;
    const { length: desiredScopeCount, direction } = this.modifier;

    const initialRange = target.contentRange.isEmpty
      ? getPreferredScopeTouchingPosition(
          scopeHandler,
          editor,
          contentRange.start,
          direction,
        )?.domain
      : contentRange;

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
            maxAncestorIndex: 0,
          },
        ),
      ),
    );

    if (scopes.length < desiredScopeCount) {
      throw new OutOfRangeError();
    }

    return [
      constructScopeRangeTarget(
        isReversed,
        scopes[0],
        scopes[scopes.length - 1],
      ),
    ];
  }
}
