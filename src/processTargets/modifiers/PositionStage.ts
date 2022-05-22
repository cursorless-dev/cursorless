import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { start, end } = target.contentRange;
    const { leadingDelimiter, trailingDelimiter } = target;

    target.position = this.modifier.position;
    target.leadingDelimiter = undefined;
    target.trailingDelimiter = undefined;

    switch (this.modifier.position) {
      case "before":
        target.contentRange = new Range(start, start);
        target.leadingDelimiter = leadingDelimiter;
        break;

      case "after":
        target.contentRange = new Range(end, end);
        target.trailingDelimiter = trailingDelimiter;
        break;

      case "start":
        target.contentRange = new Range(start, start);
        // This it NOT a raw target. Joining with this should be done on empty delimiter.
        target.delimiter = "";
        break;

      case "end":
        target.contentRange = new Range(end, end);
        target.delimiter = "";
        break;
    }

    return [target];
  }
}
