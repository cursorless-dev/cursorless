import { DestinationModifier } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";

export default class DestinationStage implements ModifierStage {
  constructor(private modifier: DestinationModifier) {}

  run(target: Target): Target[] {
    return [target.toPositionTarget(this.modifier.insertionMode)];
  }
}
