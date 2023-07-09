import { TargetPipelineRunner, isDestination } from "..";
import { TargetMark } from "../../typings/TargetDescriptor";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";

export class TargetMarkStage implements MarkStage {
  constructor(
    private targetPipelineRunner: TargetPipelineRunner,
    private mark: TargetMark,
  ) {}

  run(): Target[] {
    const targets = this.targetPipelineRunner.run(this.mark.target);
    if (targets.some(isDestination)) {
      throw Error("Target mark stage doesn't support destinations");
    }
    return targets as Target[];
  }
}
