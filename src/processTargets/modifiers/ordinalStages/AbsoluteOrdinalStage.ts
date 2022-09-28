import { Target } from "../../../typings/target.types";
import { AbsoluteOrdinalScopeModifier } from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { createTarget, getEveryScopeTargets } from "./OrdinalStagesUtil";

export class AbsoluteOrdinalStage implements ModifierStage {
  constructor(private modifier: AbsoluteOrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getEveryScopeTargets(
      context,
      target,
      this.modifier.scopeType
    );

    const startIndex =
      this.modifier.start + (this.modifier.start < 0 ? targets.length : 0);
    const endIndex = startIndex + this.modifier.length - 1;

    return [createTarget(target.isReversed, targets, startIndex, endIndex)];
  }
}
