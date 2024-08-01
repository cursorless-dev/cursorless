import type { OrdinalScopeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
} from "./targetSequenceUtils";
import { sliceStrict } from "./listUtils";

export class OrdinalScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: OrdinalScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const targets = getEveryScopeTargets(
      this.modifierStageFactory,
      target,
      this.modifier.scopeType,
    );

    const startIndex =
      this.modifier.start + (this.modifier.start < 0 ? targets.length : 0);
    const endIndex = startIndex + this.modifier.length - 1;

    if (this.modifier.isEvery) {
      return sliceStrict(targets, startIndex, endIndex);
    }

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
