import type { Target } from "../../typings/target.types";
import type { PositionModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";

export default class PositionStage implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return [target.toPositionTarget(this.modifier.position)];
  }
}
