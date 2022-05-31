import { DelimiterRangeModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class DelimiterRangeStage implements ModifierStage {
  constructor(private modifier: DelimiterRangeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.direction) {
      case "leading":
        const leading = target.getLeadingDelimiterTarget();
        if (leading == null) {
          throw Error("No available leading range");
        }
        return [leading];

      case "trailing":
        const trailing = target.getTrailingDelimiterTarget();
        if (trailing == null) {
          throw Error("No available trailing range");
        }
        return [trailing];
    }
  }
}
