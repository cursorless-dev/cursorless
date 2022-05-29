import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import PositionTarget from "../targets/PositionTarget";

export default class PositionStage implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { start, end } = target.contentRange;
    let contentRange: Range;
    let delimiter: string | undefined;

    switch (this.modifier.position) {
      case "before":
        contentRange = new Range(start, start);
        delimiter = target.delimiter;
        break;

      case "after":
        contentRange = new Range(end, end);
        delimiter = target.delimiter;
        break;

      case "start":
        contentRange = new Range(start, start);
        // This it NOT a raw target. Joining with this should be done on empty delimiter.
        delimiter = "";
        break;

      case "end":
        contentRange = new Range(end, end);
        delimiter = "";
        break;
    }

    return [
      new PositionTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange,
        position: this.modifier.position,
        delimiter,
      }),
    ];
  }
}
