import {
  NoContainingScopeError,
  type InteriorOnlyModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private modifierHandlerFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const interior = target.getInterior();

    // eg `inside pair`
    if (interior != null) {
      return interior;
    }

    // eg `inside funk`
    // The reason for this being an every scope when we have an explicit scope
    // type is because we are looking for interiors inside of the scope. We
    // don't want a normal containing behavior that expands.
    if (target.hasExplicitScopeType) {
      const everyModifier = this.modifierHandlerFactory.create({
        type: "everyScope",
        scopeType: {
          type: "interior",
        },
      });

      return everyModifier.run(target, options);
    }

    // eg `inside air`
    try {
      return createContainingInteriorStage(this.modifierHandlerFactory).run(
        target,
        options,
      );
    } catch (e) {
      if (e instanceof NoContainingScopeError) {
        throw new NoContainingScopeError("interior");
      }
      throw e;
    }
  }
}

export function createContainingInteriorStage(
  modifierHandlerFactory: ModifierStageFactory,
): ModifierStage {
  return modifierHandlerFactory.create({
    type: "containingScope",
    scopeType: {
      type: "oneOf",
      scopeTypes: [
        {
          type: "interior",
        },
        {
          type: "surroundingPairInterior",
          delimiter: "any",
        },
      ],
    },
  });
}
