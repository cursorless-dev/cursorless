import {
  ContainingScopeModifier,
  EveryScopeModifier,
  NoContainingScopeError,
} from "@cursorless/common";
import { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
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
    private languageDefinitions: LanguageDefinitions,
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ContainingScopeModifier | EveryScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const paintStage = this.modifierStageFactory.create({
      type: this.modifier.type,
      scopeType: { type: "nonWhitespaceSequence" },
    });

    const paintTargets = paintStage.run(target);
    const pairTarget = this.getPairTarget(target);

    if (pairTarget == null) {
      return paintTargets;
    }

    const targets = paintTargets.flatMap((paintTarget) => {
      const contentRange = paintTarget.contentRange.intersection(
        pairTarget.getInterior()![0].contentRange,
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

  private getPairTarget(target: Target) {
    const pairStage = this.modifierStageFactory.create({
      type: "containingScope",
      scopeType: {
        type: "surroundingPair",
        delimiter: "any",
        requireStrongContainment: true,
      },
    });
    try {
      return pairStage.run(target)[0];
    } catch (_error) {
      return undefined;
    }
  }
}
