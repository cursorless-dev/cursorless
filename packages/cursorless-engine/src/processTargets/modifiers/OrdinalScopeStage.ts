import { OrdinalScopeModifier } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
} from "./targetSequenceUtils";

export class OrdinalScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: OrdinalScopeModifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getEveryScopeTargets(
      this.modifierStageFactory,
      context,
      target,
      this.modifier.scopeType,
    );

    const startIndex =
      this.modifier.start + (this.modifier.start < 0 ? targets.length : 0);
    const endIndex = startIndex + this.modifier.length - 1;

    return [
      createRangeTargetFromIndices(
        target.isReversed,
        targets,
        startIndex,
        endIndex,
      ),
    ];
  }
}
