import type {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { containingSurroundingPairIfUntypedModifier } from "./commonContainingScopeIfUntypedModifiers";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(target: Target): Target[] {
    return this.modifierStageFactory
      .create(containingSurroundingPairIfUntypedModifier)
      .run(target)
      .flatMap((target) => target.getInteriorStrict());
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ExcludeInteriorModifier,
  ) {}

  run(target: Target): Target[] {
    return this.modifierStageFactory
      .create(containingSurroundingPairIfUntypedModifier)
      .run(target)
      .flatMap((target) => target.getBoundaryStrict());
  }
}
