import { RawSelectionModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: RawSelectionModifier,
    selection: TypedSelection
  ): TypedSelection {
    return { ...selection, isRawSelection: true };
  }
}
