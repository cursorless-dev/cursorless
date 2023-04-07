import type { RelativeScopeModifier } from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import RelativeExclusiveScopeStage from "./RelativeExclusiveScopeStage";
import { RelativeInclusiveScopeStage } from "./RelativeInclusiveScopeStage";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";

/**
 * Implements relative scope modifiers like "next funk", "two tokens", etc.
 * Proceeds by determining whether the modifier wants to include the scope(s)
 * touching the input target (ie if {@link modifier.offset} is 0), and then
 * delegating to {@link RelativeInclusiveScopeStage} if so, or
 * {@link RelativeExclusiveScopeStage} if not.
 */
export default class RelativeScopeStage implements ModifierStage {
  private modiferStage: ModifierStage;
  constructor(
    modifierStageFactory: ModifierStageFactory,
    scopeHandlerFactory: ScopeHandlerFactory,
    modifier: RelativeScopeModifier,
  ) {
    this.modiferStage =
      modifier.offset === 0
        ? new RelativeInclusiveScopeStage(
            modifierStageFactory,
            scopeHandlerFactory,
            modifier,
          )
        : new RelativeExclusiveScopeStage(
            modifierStageFactory,
            scopeHandlerFactory,
            modifier,
          );
  }

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return this.modiferStage.run(context, target);
  }
}
