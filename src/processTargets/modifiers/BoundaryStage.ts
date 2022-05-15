import { BoundaryModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: BoundaryModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (target.boundary == null) {
      throw Error("No available boundary");
    }
    return target.boundary.map((contentRange) => ({
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
    }));
  }
}
