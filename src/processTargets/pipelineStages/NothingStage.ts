import { TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(): TypedSelection[] {
    return [];
  }
}
