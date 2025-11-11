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
