import { Target } from "../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { TokenTarget } from "../targets";
import getModifierStage from "../getModifierStage";
import { processSurroundingPair } from "./surroundingPair";

export type BoundedNonWhitespaceSequenceModifier = (
  | ContainingScopeModifier
  | EveryScopeModifier
) & {
  scopeType: { type: "boundedNonWhitespaceSequence" };
};

/**
 * Intersection of NonWhitespaceSequenceStage and InteriorOnlyStage
 * Expand the target until reaching a white space or surrounding pair.
 * If there is no surrounding pair defaults to the non white space sequence
 */
export default class BoundedNonWhitespaceSequenceStage
  implements ModifierStage
{
  constructor(private modifier: BoundedNonWhitespaceSequenceModifier) {}

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
      }
    );

    if (!pairInfo) {
      return paintTargets;
    }

    return paintTargets.map((paintTarget) => {
      if (!paintTarget) {
        throw Error("No paint target to intersect with");
      }
      const contentRange = paintTarget.contentRange.intersection(
        pairInfo.interiorRange
      );

      if (!contentRange) {
        throw Error("No content range after intersection");
      }

      return new TokenTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange,
      });
    });
  }
}
