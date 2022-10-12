import { Target } from "../../typings/target.types";
import { OrdinalScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import { ModifierStage } from "../PipelineStages.types";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
} from "./targetSequenceUtils";

export class OrdinalScopeStage implements ModifierStage {
  constructor(private modifier: OrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.scopeType.type) {
      case "token":
        return this.runNew(target);
      default:
        return this.runLegacy(context, target);
    }
  }

  private runNew(target: Target): Target[] {
    const scopeHandler = getScopeHandler(this.modifier.scopeType);
    const iterationScope = scopeHandler.run(
      target.editor,
      target.contentRange,
      target.isReversed,
      target.hasExplicitRange
    );

    return this.calculateIndicesAndCreateTarget(target, iterationScope.targets);
  }

  private runLegacy(
    context: ProcessedTargetsContext,
    target: Target
  ): Target[] {
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
