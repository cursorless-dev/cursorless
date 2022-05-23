import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return [target.withPosition(this.modifier.position)];
  }
}
