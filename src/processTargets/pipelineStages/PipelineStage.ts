import { PipelineStageDescriptor } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";

export default interface PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: PipelineStageDescriptor,
    target?: TypedSelection
  ): TypedSelection | TypedSelection[];
}
