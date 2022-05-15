import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    const res = {
      editor: target.editor,
      isReversed: false,
    };
    switch (this.modifier.position) {
      case "before":
      case "start":
        return {
          ...res,
          contentRange: new Range(
            target.contentRange.start,
            target.contentRange.start
          ),
        };
      case "after":
      case "end":
        return {
          ...res,
          contentRange: new Range(
            target.contentRange.end,
            target.contentRange.end
          ),
        };
    }
  }
}
