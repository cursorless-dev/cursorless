import { PositionModifier, Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";
import { PlainTarget } from "../targets";

export default class PositionStage implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(target: Target): Target[] {
    const position =
      this.modifier.position === "start"
        ? target.contentRange.start
        : target.contentRange.end;

    return [
      new PlainTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: new Range(position, position),
      }),
    ];
  }
}
