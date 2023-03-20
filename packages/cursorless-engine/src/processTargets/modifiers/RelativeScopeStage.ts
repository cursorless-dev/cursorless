import type { Target } from "../../typings/target.types";
import type { RelativeScopeModifier } from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import RelativeExclusiveScopeStage from "./RelativeExclusiveScopeStage";
import { RelativeInclusiveScopeStage } from "./RelativeInclusiveScopeStage";

/**
 * Implements relative scope modifiers like "next funk", "two tokens", etc.
 * Proceeds by determining whether the modifier wants to include the scope(s)
 * touching the input target (ie if {@link modifier.offset} is 0), and then
 * delegating to {@link RelativeInclusiveScopeStage} if so, or
 * {@link RelativeExclusiveScopeStage} if not.
 */
export default class RelativeScopeStage implements ModifierStage {
  private modiferStage: ModifierStage;
  constructor(private modifier: RelativeScopeModifier) {
    this.modiferStage =
      this.modifier.offset === 0
        ? new RelativeInclusiveScopeStage(modifier)
        : new RelativeExclusiveScopeStage(modifier);
  }

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return this.modiferStage.run(context, target);
  }
}
