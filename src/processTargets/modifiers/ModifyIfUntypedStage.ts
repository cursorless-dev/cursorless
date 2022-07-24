import { Target } from "../../typings/target.types";
import { ModifyIfUntypedModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

/**
 * Runs {@link ModifyIfUntypedModifier.modifier} if the target is lacking an explicit modifier.
 */
export default class ModifyIfUntypedStage implements ModifierStage {
  private nestedStage_?: ModifierStage;

  constructor(private modifier: ModifyIfUntypedModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    // If true this target has an explicit scope type and should not be modified.
    if (target.hasExplicitScopeType) {
      return [target];
    }

    /**
     * This target is lacking an explicit scope type and should use inference/upgrade when needed.
     * See {@link UntypedTarget} for more info
     */
    return this.nestedStage
      .run(context, target)
      .map((newTarget) => newTarget.withThatTarget(target));
  }

  private get nestedStage() {
    if (this.nestedStage_ == null) {
      this.nestedStage_ = getModifierStage(this.modifier.modifier);
    }

    return this.nestedStage_;
  }
}
