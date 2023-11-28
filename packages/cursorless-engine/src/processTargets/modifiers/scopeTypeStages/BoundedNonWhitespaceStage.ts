import {
  ContainingScopeModifier,
  EveryScopeModifier,
  NoContainingScopeError,
} from "@cursorless/common";
import { Target } from "../../../typings/target.types";
import { ModifierStageFactory } from "../../ModifierStageFactory";
import { ModifierStage } from "../../PipelineStages.types";
import { TokenTarget } from "../../targets";

/**
 * Intersection of NonWhitespaceSequenceStage and a surrounding pair
 * Expand the target until reaching a white space or surrounding pair.
 * If there is no surrounding pair defaults to the non white space sequence
 */
export class BoundedNonWhitespaceSequenceStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ContainingScopeModifier | EveryScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const paintStage = this.modifierStageFactory.create({
      type: this.modifier.type,
      scopeType: { type: "nonWhitespaceSequence" },
    });
    const surroundingPairStage = this.modifierStageFactory.create({
      type: "containingScope",
      scopeType: {
        type: "surroundingPair",
        delimiter: "any",
        requireStrongContainment: true,
      },
    });

    const paintTargets = paintStage.run(target);

    const pairTarget = (() => {
      try {
        return surroundingPairStage.run(target)[0];
      } catch (error) {
        return undefined;
      }
    })();

    if (pairTarget == null) {
      return paintTargets;
    }

    const targets = paintTargets.flatMap((paintTarget) => {
      const contentRange = paintTarget.contentRange.intersection(
        pairTarget.getInteriorStrict()[0].contentRange,
      );

      if (contentRange == null || contentRange.isEmpty) {
        return [];
      }

      return [
        new TokenTarget({
          editor: target.editor,
          isReversed: target.isReversed,
          contentRange,
        }),
      ];
    });

    if (targets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return targets;
  }
}
