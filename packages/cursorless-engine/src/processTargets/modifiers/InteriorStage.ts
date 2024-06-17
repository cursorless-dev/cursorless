import {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
} from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";
import { ModifyIfConditionStage } from "./ConditionalModifierStages";

export class InteriorOnlyStage implements ModifierStage {
  private containingSurroundingPairIfNoInteriorStage: ModifierStage;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {
    this.containingSurroundingPairIfNoInteriorStage =
      getContainingSurroundingPairIfNoInteriorStage(this.modifierStageFactory);
  }

  run(target: Target): Target[] {
    return this.containingSurroundingPairIfNoInteriorStage
      .run(target)
      .flatMap((target) => target.getInterior()!);
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  private containingSurroundingPairIfNoBoundaryStage: ModifierStage;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ExcludeInteriorModifier,
  ) {
    this.containingSurroundingPairIfNoBoundaryStage =
      getContainingSurroundingPairIfNoBoundaryStage(this.modifierStageFactory);
  }

  run(target: Target): Target[] {
    return this.containingSurroundingPairIfNoBoundaryStage
      .run(target)
      .flatMap((target) => target.getBoundary()!);
  }
}

function getContainingSurroundingPairIfNoInteriorStage(
  modifierStageFactory: ModifierStageFactory,
): ModifierStage {
  return new ModifyIfConditionStage(
    modifierStageFactory,
    {
      type: "containingScope",
      scopeType: { type: "surroundingPair", delimiter: "any" },
    },
    (target) => target.getInterior() == null,
  );
}

export function getContainingSurroundingPairIfNoBoundaryStage(
  modifierStageFactory: ModifierStageFactory,
): ModifierStage {
  return new ModifyIfConditionStage(
    modifierStageFactory,
    {
      type: "containingScope",
      scopeType: { type: "surroundingPair", delimiter: "any" },
    },
    (target) => target.getBoundary() == null,
  );
}
