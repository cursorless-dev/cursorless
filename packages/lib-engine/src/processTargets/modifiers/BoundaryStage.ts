import { type ExcludeInteriorModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import { ModifyIfConditionStage } from "./ConditionalModifierStages";

export class ExcludeInteriorStage implements ModifierStage {
  private containingSurroundingPairIfNoBoundaryStage: ModifierStage;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ExcludeInteriorModifier,
  ) {
    this.containingSurroundingPairIfNoBoundaryStage =
      getContainingSurroundingPairIfNoBoundaryStage(this.modifierStageFactory);
  }

  run(target: Target, options: ModifierStateOptions): Target[] {
    return this.containingSurroundingPairIfNoBoundaryStage
      .run(target, options)
      .flatMap((target) => target.getBoundary()!);
  }
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
