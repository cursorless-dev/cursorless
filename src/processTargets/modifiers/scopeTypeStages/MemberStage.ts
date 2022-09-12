import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { processSurroundingPair } from "../surroundingPair";
import { RegexStageBase } from "./RegexStage";

export default class MemberStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const pairInfo = processSurroundingPair(
      context,
      target.editor,
      target.contentRange,
      {
        type: "surroundingPair",
        delimiter: "parentheses",
        requireStrongContainment: true,
      }
    );

    const regexStage = new RegexStageBase(
      this.modifier,
      /([\w.](\(.*\))?)+/g,
      pairInfo != null ? pairInfo.interiorRange : undefined
    );

    return regexStage.run(context, target);
  }
}
