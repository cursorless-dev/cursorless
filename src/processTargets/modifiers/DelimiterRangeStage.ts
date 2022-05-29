import { Range } from "vscode";
import { DelimiterRangeModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import DelimiterRangeTarget from "../targets/DelimiterRangeTarget";

export default class DelimiterRangeStage implements ModifierStage {
  constructor(private modifier: DelimiterRangeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    let contentRange: Range;

    switch (this.modifier.direction) {
      case "leading":
        const leading = target.getLeadingDelimiterRange(true);
        if (leading == null) {
          throw Error("No available leading range");
        }
        contentRange = leading;
        break;

      case "trailing":
        const trailing = target.getTrailingDelimiterRange(true);
        if (trailing == null) {
          throw Error("No available trailing range");
        }
        contentRange = trailing;
    }

    return [
      new DelimiterRangeTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange,
        isLine: target.is("paragraph"),
      }),
    ];
  }
}
