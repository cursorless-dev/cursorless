import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { getTokenContextUnsafe } from "./scopeTypeStages/TokenStage";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    const { position } = this.modifier;
    const { contentRange } = target;

    // TODO necessary for "chuck before [token] air" to get the correct token context
    const tokenContext =
      target.scopeType === "token" &&
      (position === "before" || position === "after")
        ? getTokenContextUnsafe(target)
        : undefined;

    const common = {
      position: this.modifier.position,
      editor: target.editor,
      isReversed: target.isReversed,
    };

    const delimiter = tokenContext?.delimiter ?? target.delimiter;
    const leadingDelimiterRange =
      tokenContext?.leadingDelimiterRange ?? target.leadingDelimiterRange;
    const trailingDelimiterRange =
      tokenContext?.trailingDelimiterRange ?? target.trailingDelimiterRange;
    const leadingDelimiterHighlightRange =
      tokenContext?.leadingDelimiterRange == null
        ? target.leadingDelimiterHighlightRange
        : undefined;
    const trailingDelimiterHighlightRange =
      tokenContext?.trailingDelimiterRange == null
        ? target.trailingDelimiterHighlightRange
        : undefined;

    switch (position) {
      case "before":
        return {
          ...common,
          contentRange: new Range(contentRange.start, contentRange.start),
          delimiter,
          removalRange: leadingDelimiterRange,
          leadingDelimiterHighlightRange,
        };

      case "after":
        return {
          ...common,
          contentRange: new Range(contentRange.end, contentRange.end),
          delimiter,
          removalRange: trailingDelimiterRange,
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
