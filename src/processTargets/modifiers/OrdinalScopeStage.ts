import { Target } from "../../typings/target.types";
import { OrdinalScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
} from "./targetSequenceUtils";

export class OrdinalScopeStage implements ModifierStage {
  constructor(private modifier: OrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getEveryScopeTargets(
      context,
      target,
      this.modifier.scopeType
    );

    return this.calculateIndicesAndCreateTarget(target, targets);
  }

  private calculateIndicesAndCreateTarget(
    target: Target,
    targets: Target[]
  ): Target[] {
    const startIndex =
      this.modifier.start + (this.modifier.start < 0 ? targets.length : 0);
    const endIndex = startIndex + this.modifier.length - 1;

    return [
      createRangeTargetFromIndices(
        target.isReversed,
        targets,
        startIndex,
        endIndex
      ),
    ];
  }
}
