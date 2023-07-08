import { PositionModifier, Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";
import {
  CommonTargetParameters,
  PlainTarget,
  RawSelectionTarget,
} from "../targets";

export default class PositionStage implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(target: Target): Target[] {
    const position =
      this.modifier.position === "start"
        ? target.contentRange.start
        : target.contentRange.end;

    const parameters: CommonTargetParameters = {
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: new Range(position, position),
    };

    return [
      target.isRaw
        ? new RawSelectionTarget(parameters)
        : new PlainTarget({ ...parameters, isToken: false }),
    ];
  }
}
