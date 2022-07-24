import { Target } from "../../typings/target.types";
import {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { implicitScopeTypeContainingSurroundingPairStage } from "./commonImplicitScopeTypeContainingScopeStages";

export class InteriorOnlyStage implements ModifierStage {
  constructor(private modifier: InteriorOnlyModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return implicitScopeTypeContainingSurroundingPairStage
      .run(context, target)
      .flatMap((target) => target.getInteriorStrict());
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  constructor(private modifier: ExcludeInteriorModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return implicitScopeTypeContainingSurroundingPairStage
      .run(context, target)
      .flatMap((target) => target.getBoundaryStrict());
  }
}
