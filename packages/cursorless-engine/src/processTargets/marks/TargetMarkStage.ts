import { TargetPipelineRunner } from "../TargetPipelineRunner";
import { TargetMark } from "../../typings/TargetDescriptor";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";

export class TargetMarkStage implements MarkStage {
  constructor(
    private targetPipelineRunner: TargetPipelineRunner,
    private mark: TargetMark,
  ) {}

  async run(): Promise<Target[]> {
    return await this.targetPipelineRunner.run(this.mark.target);
  }
}
