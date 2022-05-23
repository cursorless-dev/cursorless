import {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export class InteriorOnlyStage implements ModifierStage {
  constructor(private modifier: InteriorOnlyModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return target.getInterior(context);
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  constructor(private modifier: ExcludeInteriorModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return target.getBoundary(context);
  }
}
