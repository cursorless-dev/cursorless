import { Target } from "../../typings/target.types";
import { PositionModifier } from "@cursorless/common";
import { ModifierStage } from "../PipelineStages.types";

export default class PositionStage implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(target: Target): Target[] {
    return [target.toPositionTarget(this.modifier.position)];
  }
}
