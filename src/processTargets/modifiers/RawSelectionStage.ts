import { RawSelectionModifier, Target } from "../../typings/target.types";
import BaseTarget from "../targets/BaseTarget";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: RawSelectionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return [
      new BaseTarget({
        editor: target.editor,
        contentRange: target.contentRange,
        isReversed: target.isReversed,
      }),
    ];
  }
}
