import { RawSelectionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: RawSelectionModifier) {}

  run(context: ProcessedTargetsContext, selection: Target): Target {
    return { ...selection, isRawSelection: true };
  }
}
