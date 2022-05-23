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
    const interiorTargets = target.getInterior(context);
    if (interiorTargets == null) {
      throw Error("No available interior");
    }
    return interiorTargets;
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  constructor(private modifier: ExcludeInteriorModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const boundaryTargets = target.getBoundary(context);
    if (boundaryTargets == null) {
      throw Error("No available boundaries");
    }
    return boundaryTargets;
  }
}
