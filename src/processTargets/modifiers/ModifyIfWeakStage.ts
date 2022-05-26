import { Modifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  private nestedStage: ModifierStage;

  constructor(nestedModifier: Modifier) {
    this.nestedStage = getModifierStage(nestedModifier);
  }

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (target.isWeak) {
      return this.nestedStage
        .run(context, target)
        .map((newTarget) => newTarget.withThatTarget(target));
    }
    return [target];
  }
}
