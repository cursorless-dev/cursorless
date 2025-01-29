import {
  type ExcludeInteriorModifier,
  type InteriorOnlyModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { ModifyIfConditionStage } from "./ConditionalModifierStages";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private modifierHandlerFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(target: Target): Target[] {
    const interior = target.getInterior();

    if (interior != null) {
      return interior;
    }

    const containingModifier = this.modifierHandlerFactory.create({
      type: "containingScope",
      scopeType: {
        type: "interior",
        useFallback: target.hasExplicitScopeType,
      },
    });

    return containingModifier.run(target);
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
