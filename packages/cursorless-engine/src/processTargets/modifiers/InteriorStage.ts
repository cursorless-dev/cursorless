import { type InteriorOnlyModifier } from "@cursorless/common";
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
    const containingModifier = this.modifierHandlerFactory.create({
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

    return containingModifier.run(target, options);
  }
}
