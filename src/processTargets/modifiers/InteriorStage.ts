import { InteriorModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: InteriorModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    if (target.interiorRange == null) {
      throw Error("No available interior");
    }
    return {
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: target.interiorRange,
    };
  }
}
