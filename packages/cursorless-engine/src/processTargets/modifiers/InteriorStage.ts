import {
  NoContainingScopeError,
  type ExcludeInteriorModifier,
  type InteriorOnlyModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import { ModifyIfConditionStage } from "./ConditionalModifierStages";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private modifierHandlerFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const interior = target.getInterior();

    if (interior != null) {
      return interior;
    }

    if (target.hasExplicitScopeType) {
      throw new NoContainingScopeError("interior");
    }

    const containingModifier = this.modifierHandlerFactory.create({
      type: "containingScope",
      scopeType: {
        type: "interior",
      },
    });

    return containingModifier.run(target, options);
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
