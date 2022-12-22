import { Target } from "../../typings/target.types";
import { NothingMark } from "../../core/commandRunner/typings/PartialTargetDescriptor.types";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private mark: NothingMark) {}

  run(): Target[] {
    return [];
  }
}
