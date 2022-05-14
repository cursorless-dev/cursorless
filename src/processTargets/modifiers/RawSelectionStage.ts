import { RawSelectionModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: RawSelectionModifier) {}

  run(
    context: ProcessedTargetsContext,
    selection: TypedSelection
  ): TypedSelection {
    return { ...selection, isRawSelection: true };
  }
}
