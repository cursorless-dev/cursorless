import { ContainingScopeModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private nestedModifier: ContainingScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (target.isWeak) {
      const stage = getModifierStage(this.nestedModifier);
      return stage
        .run(context, target)
        .map((newTarget) => newTarget.withWeakTarget(target));
    }
    return [target];
  }
}
