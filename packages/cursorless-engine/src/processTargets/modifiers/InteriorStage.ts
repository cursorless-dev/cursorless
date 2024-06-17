import {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
} from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";

export class InteriorOnlyStage implements ModifierStage {
  private containingSurroundingPairModifierStage: ModifierStage;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {
    this.containingSurroundingPairModifierStage =
      this.modifierStageFactory.create({
        type: "containingScope",
        scopeType: { type: "surroundingPair", delimiter: "any" },
      });
  }

  run(target: Target): Target[] {
    return (
      target.getInterior() ??
      this.containingSurroundingPairModifierStage
        .run(target)
        .flatMap((target) => target.getInterior()!)
    );
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  private containingSurroundingPairModifierStage: ModifierStage;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ExcludeInteriorModifier,
  ) {
    this.containingSurroundingPairModifierStage =
      this.modifierStageFactory.create({
        type: "containingScope",
        scopeType: { type: "surroundingPair", delimiter: "any" },
      });
  }

  run(target: Target): Target[] {
    return (
      target.getInterior() ??
      this.containingSurroundingPairModifierStage
        .run(target)
        .flatMap((target) => target.getBoundary()!)
    );
  }
}
