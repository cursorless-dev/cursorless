import {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
} from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";
import { containingSurroundingPairIfUntypedModifier } from "./commonContainingScopeIfUntypedModifiers";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return this.modifierStageFactory
      .create(containingSurroundingPairIfUntypedModifier)
      .run(context, target)
      .flatMap((target) => target.getInteriorStrict());
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ExcludeInteriorModifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return this.modifierStageFactory
      .create(containingSurroundingPairIfUntypedModifier)
      .run(context, target)
      .flatMap((target) => target.getBoundaryStrict());
  }
}
