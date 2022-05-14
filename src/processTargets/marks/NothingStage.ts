import { TypedSelection } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  run(): TypedSelection[] {
    return [];
  }
}
