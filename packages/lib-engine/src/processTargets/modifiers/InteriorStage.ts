import type { InteriorOnlyModifier } from "@cursorless/lib-common";
import {
  NoContainingScopeError,
  UnsupportedScopeError,
} from "@cursorless/lib-common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import type { SortedScopeType } from "./scopeHandlers/scopeHandler.types";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const interior = target.getInterior();

    // eg "inside pair"
    if (interior != null) {
      return interior;
    }

    // eg "inside funk"
    // When you say "inside funk", in an ideal world, the function target would
    // have a defined interior property that we could just use directly.
    // However, it is painful to define interiors for every single scope in
    // every single language, particularly scopes like "if", which could have
    // multiple interiors and tends to be defined in a tricky nested way in the
    // parse tree. Instead, we just define interior as a scope, and then call
    // every interior on the input target here. This will work as expected in
    // most cases, as long as the nearest interior is what we expect, which it
    // usually is.
    if (target.hasExplicitScopeType) {
      const everyModifier = this.modifierStageFactory.create({
        type: "everyScope",
        scopeType: {
          type: "interior",
        },
      });

      try {
        return everyModifier.run(target, options);
      } catch (error) {
        if (error instanceof UnsupportedScopeError) {
          throw new NoContainingScopeError("interior");
        }
        throw error;
      }
    }

    // eg "inside air"
    try {
      return this.modifierStageFactory
        .create({
          type: "complexContainingScope",
          scopeType: compoundInteriorScopeType,
        })
        .run(target, options);
    } catch (error) {
      if (error instanceof NoContainingScopeError) {
        throw new NoContainingScopeError("interior");
      }
      throw error;
    }
  }
}

export const compoundInteriorScopeType: SortedScopeType = {
  type: "sorted",
  scopeTypes: [
    {
      type: "interior",
    },
    {
      type: "surroundingPairInterior",
      delimiter: "any",
    },
  ],
};
