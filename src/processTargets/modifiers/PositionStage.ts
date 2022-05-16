import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    const {
      contentRange,
      delimiter,
      leadingDelimiterRange,
      leadingDelimiterHighlightRange,
      trailingDelimiterRange,
      trailingDelimiterHighlightRange,
    } = target;

    const common = {
      editor: target.editor,
      position: this.modifier.position,
      isReversed: false,
    };

    switch (this.modifier.position) {
      case "before":
        return {
          ...common,
          contentRange: new Range(contentRange.start, contentRange.start),
          delimiter,
          leadingDelimiterRange,
          leadingDelimiterHighlightRange,
        };

      case "after":
        return {
          ...common,
          contentRange: new Range(contentRange.end, contentRange.end),
          delimiter,
          trailingDelimiterRange,
          trailingDelimiterHighlightRange,
        };

      case "start":
        return {
          ...common,
          contentRange: new Range(contentRange.start, contentRange.start),
        };

      case "end":
        return {
          ...common,
          contentRange: new Range(contentRange.end, contentRange.end),
        };
    }
  }
}
