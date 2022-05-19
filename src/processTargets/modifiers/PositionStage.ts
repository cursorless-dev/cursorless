import { Range } from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    const { position } = this.modifier;
    const { start, end } = target.contentRange;
    const {
      editor,
      isReversed,
      delimiter,
      scopeType,
      leadingDelimiter,
      trailingDelimiter,
    } = target;

    const common = {
      position: this.modifier.position,
      editor,
      isReversed,
    };

    const constructor = Object.getPrototypeOf(target).constructor;

    switch (position) {
      case "before":
        return new constructor({
          ...common,
          contentRange: new Range(start, start),
          delimiter,
          scopeType,
          leadingDelimiter,
        });

      case "after":
        return new constructor({
          ...common,
          contentRange: new Range(end, end),
          delimiter,
          scopeType,
          trailingDelimiter,
        });

      case "start":
        return new constructor({
          ...common,
          contentRange: new Range(start, start),
          // This it NOT a raw target. Joining with this should be done on empty delimiter.
          delimiter: "",
        });

      case "end":
        return new constructor({
          ...common,
          contentRange: new Range(end, end),
          delimiter: "",
        });
    }
  }
}
