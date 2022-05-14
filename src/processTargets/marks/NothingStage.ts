import { TypedSelection } from "../../typings/Types";
import PipelineStage from "../PipelineStages.types";

export default class implements PipelineStage {
  run(): TypedSelection[] {
    return [];
  }
}
