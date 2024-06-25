import { RangeMark } from "../../typings/TargetDescriptor";
import { Target } from "../../typings/target.types";
import { MarkStageFactory } from "../MarkStageFactory";
import { MarkStage } from "../PipelineStages.types";
import { targetsToContinuousTarget } from "../TargetPipelineRunner";

export class RangeMarkStage implements MarkStage {
  constructor(
    private markStageFactory: MarkStageFactory,
    private mark: RangeMark,
  ) {}

  run(): Target[] {
    const anchorStage = this.markStageFactory.create(this.mark.anchor);
    const activeStage = this.markStageFactory.create(this.mark.active);
    const anchorTargets = anchorStage.run();
    const activeTargets = activeStage.run();

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
