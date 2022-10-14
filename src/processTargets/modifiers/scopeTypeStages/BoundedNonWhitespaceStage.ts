import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { TokenTarget } from "../../targets";
import getModifierStage from "../../getModifierStage";
import { processSurroundingPair } from "../surroundingPair";
import { NoContainingScopeError } from "../../../errors";

/**
 * Intersection of NonWhitespaceSequenceStage and a surrounding pair
 * Expand the target until reaching a white space or surrounding pair.
 * If there is no surrounding pair defaults to the non white space sequence
 */
export default class BoundedNonWhitespaceSequenceStage
  implements ModifierStage
{
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const paintStage = getModifierStage({
      type: this.modifier.type,
      scopeType: { type: "nonWhitespaceSequence" },
    });

    const paintTargets = paintStage.run(context, target);

    const pairInfo = processSurroundingPair(
      context,
      target.editor,
      target.contentRange,
      {
        type: "surroundingPair",
        delimiter: "any",
        requireStrongContainment: true,
      }
    );

    if (pairInfo == null) {
      return paintTargets;
    }

    const targets = paintTargets.flatMap((paintTarget) => {
      const contentRange = paintTarget.contentRange.intersection(
        pairInfo.interiorRange
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
