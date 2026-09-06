import type { Target } from "../../typings/target.types";
import type { TargetMark } from "../../typings/TargetDescriptor";
import type { MarkStage } from "../PipelineStages.types";
import type { TargetPipelineRunner } from "../TargetPipelineRunner";

export class TargetMarkStage implements MarkStage {
  constructor(
    private targetPipelineRunner: TargetPipelineRunner,
    private mark: TargetMark,
  ) {}

  run(): Target[] {
    return this.targetPipelineRunner.run(this.mark.target);
  }
}
