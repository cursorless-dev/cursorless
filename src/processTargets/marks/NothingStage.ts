import { NothingMark } from "../../typings/target.types";
import { TypedSelection } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: NothingMark) {}

  run(): TypedSelection[] {
    return [];
  }
}
