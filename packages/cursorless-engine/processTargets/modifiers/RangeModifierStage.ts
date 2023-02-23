import { Target } from "../../typings/target.types";
import { RangeModifier } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";
import { targetsToContinuousTarget } from "../processTargets";

export default class RangeModifierStage implements ModifierStage {
  constructor(private modifier: RangeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const anchorStage = getModifierStage(this.modifier.anchor);
    const activeStage = getModifierStage(this.modifier.active);
    const anchorTargets = anchorStage.run(context, target);
    const activeTargets = activeStage.run(context, target);

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
