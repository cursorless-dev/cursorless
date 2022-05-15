import { NothingMark, Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: NothingMark) {}

  run(): Target[] {
    return [];
  }
}
