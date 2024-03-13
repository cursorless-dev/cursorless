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
import { processSurroundingPair } from "../surroundingPair";

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

  async run(target: Target): Promise<Target[]> {
    const paintStage = this.modifierStageFactory.create({
      type: this.modifier.type,
      scopeType: { type: "nonWhitespaceSequence" },
    });

    const paintTargets = await paintStage.run(target);

    const pairInfo = processSurroundingPair(this.languageDefinitions, target, {
      type: "surroundingPair",
      delimiter: "any",
      requireStrongContainment: true,
    });

    if (pairInfo == null) {
      return paintTargets;
    }

    const targets = paintTargets.flatMap(async (paintTarget) => {
      const contentRange = paintTarget.contentRange.intersection(
        (await pairInfo.getInteriorStrict())[0].contentRange,
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

    /* TODO: 
    Type 'TokenTarget[]' is not assignable to type 'Target[]'.
    Type 'TokenTarget' is not assignable to type 'Target'.
    The types returned by 'getInteriorStrict()' are incompatible between these types.
    Type 'Target[]' is missing the following properties from type 'Promise<Target[]>': then, catch, finally, [Symbol.toStringTag]ts(2322) 
    */
    return targets;
  }
}
