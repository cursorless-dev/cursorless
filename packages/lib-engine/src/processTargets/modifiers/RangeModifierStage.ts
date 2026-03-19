import type { RangeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import { targetsToContinuousTarget } from "../TargetPipelineRunner";

export class RangeModifierStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: RangeModifier,
  ) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const anchorStage = this.modifierStageFactory.create(this.modifier.anchor);
    const activeStage = this.modifierStageFactory.create(this.modifier.active);
    const anchorTargets = anchorStage.run(target, options);
    const activeTargets = activeStage.run(target, options);

    if (anchorTargets.length !== 1 || activeTargets.length !== 1) {
      throw new Error("Expected single anchor and active target");
    }

    return [
      targetsToContinuousTarget(
        anchorTargets[0],
        activeTargets[0],
        this.modifier.excludeAnchor,
        this.modifier.excludeActive,
      ),
    ];
  }
}
