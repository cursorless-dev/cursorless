import { zip } from "lodash";
import { Target } from "../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { TokenTarget } from "../targets";
import { NonWhitespaceSequenceStage } from "./scopeTypeStages/RegexStage";
import { InteriorOnlyStage } from "./InteriorStage";

export type NonWhitespaceOrQuoteSequenceModifier = (
  | ContainingScopeModifier
  | EveryScopeModifier
) & {
  scopeType: { type: "nonWhitespaceOrQuoteSequence" };
};

/**
 * Intersection of NonWhitespaceSequenceStage and InteriorOnlyStage
 * Expand the target until reaching a white space or surrounding pair.
 * If there is no surrounding pair defaults to the non white space sequence
 */
export default class SmallPaintStage implements ModifierStage {
  constructor(private modifier: NonWhitespaceOrQuoteSequenceModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const paintStage = new NonWhitespaceSequenceStage({
      type: "containingScope",
      scopeType: { type: "nonWhitespaceSequence" },
    });

    const surroundingPairStage = new InteriorOnlyStage({
      type: "interiorOnly",
    });

    const paintTargets = paintStage.run(context, target);

    try {
      const pairTargets = surroundingPairStage.run(context, target);
      return zip(paintTargets, pairTargets).map(([paintTarget, pairTarget]) => {
        if (!paintTarget || !pairTarget) {
          throw Error(
            "Pair targets and surrounding targets are of different length"
          );
        }
        const contentRange = paintTarget.contentRange.intersection(
          pairTarget.contentRange
        );

        if (!contentRange) {
          throw Error("No content range to intersect");
        }

        return new TokenTarget({
          editor: target.editor,
          isReversed: target.isReversed,
          contentRange,
        });
      });
    } catch (error) {
      return paintTargets;
    }
  }
}
