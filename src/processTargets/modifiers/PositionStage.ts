import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    const { position } = this.modifier;
    const {
      editor,
      isReversed,
      contentRange,
      delimiter,
      removal: { leadingDelimiterRange, trailingDelimiterRange } = {},
    } = target;

    const common = {
      position: this.modifier.position,
      editor,
      isReversed,
    };

    switch (position) {
      case "before":
        return {
          ...common,
          contentRange: new Range(contentRange.start, contentRange.start),
          delimiter,
          removal: {
            range: leadingDelimiterRange,
          },
        };

      case "after":
        return {
          ...common,
          contentRange: new Range(contentRange.end, contentRange.end),
          delimiter,
          removal: {
            range: trailingDelimiterRange,
          },
        };

      case "start":
        return {
          ...common,
          contentRange: new Range(contentRange.start, contentRange.start),
          delimiter: "",
        };

      case "end":
        return {
          ...common,
          contentRange: new Range(contentRange.end, contentRange.end),
          delimiter: "",
        };
    }
  }
}
