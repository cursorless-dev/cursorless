import type { Target } from "../../typings/target.types";
import type { NothingMark } from "../../typings/targetDescriptor.types";
import type { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: NothingMark) {}

  run(): Target[] {
    return [];
  }
}
