import { RangeMark } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { MarkStageFactory } from "../MarkStageFactory";
import { MarkStage } from "../PipelineStages.types";
import { targetsToContinuousTarget } from "../TargetPipeline";

export default class RangeMarkStage implements MarkStage {
  constructor(
    private markStageFactory: MarkStageFactory,
    private mark: RangeMark,
  ) {}

  run(context: ProcessedTargetsContext): Target[] {
    const anchorStage = this.markStageFactory.create(this.mark.anchor);
    const activeStage = this.markStageFactory.create(this.mark.active);
    const anchorTargets = anchorStage.run(context);
    const activeTargets = activeStage.run(context);

    if (anchorTargets.length !== 1 || activeTargets.length !== 1) {
      throw new Error("Expected single anchor and active target");
    }

    return [
      targetsToContinuousTarget(
        anchorTargets[0],
        activeTargets[0],
        this.mark.excludeAnchor,
        this.mark.excludeActive,
      ),
    ];
  }
}
