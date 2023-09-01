import type {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "@cursorless/common";
import { NoContainingScopeError } from "@cursorless/common";
import type { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import type { Target } from "../../../typings/target.types";
import type { ModifierStageFactory } from "../../ModifierStageFactory";
import type { ModifierStage } from "../../PipelineStages.types";
import { TokenTarget } from "../../targets";
import { processSurroundingPair } from "../surroundingPair";

/**
 * Intersection of NonWhitespaceSequenceStage and a surrounding pair
 * Expand the target until reaching a white space or surrounding pair.
 * If there is no surrounding pair defaults to the non white space sequence
 */
export default class BoundedNonWhitespaceSequenceStage
  implements ModifierStage
{
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

    const pairInfo = processSurroundingPair(this.languageDefinitions, target, {
      type: "surroundingPair",
      delimiter: "any",
      requireStrongContainment: true,
    });

    if (pairInfo == null) {
      return paintTargets;
    }

    const targets = paintTargets.flatMap((paintTarget) => {
      const contentRange = paintTarget.contentRange.intersection(
        pairInfo.getInteriorStrict()[0].contentRange,
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
