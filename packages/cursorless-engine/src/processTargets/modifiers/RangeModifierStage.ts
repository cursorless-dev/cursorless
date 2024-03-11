import { RangeModifier } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";
import { targetsToContinuousTarget } from "../TargetPipelineRunner";

export class RangeModifierStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: RangeModifier,
  ) {}

  async run(target: Target): Promise<Target[]> {
    const anchorStage = this.modifierStageFactory.create(this.modifier.anchor);
    const activeStage = this.modifierStageFactory.create(this.modifier.active);
    const anchorTargets = await anchorStage.run(target);
    const activeTargets = await activeStage.run(target);

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
