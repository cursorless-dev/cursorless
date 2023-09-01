import type { Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStage } from "../PipelineStages.types";
import type { CommonTargetParameters } from "../targets";
import { PlainTarget, RawSelectionTarget } from "../targets";

abstract class PositionStage implements ModifierStage {
  run(target: Target): Target[] {
    const parameters: CommonTargetParameters = {
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: this.getContentRange(target.contentRange),
    };

    return [
      target.isRaw
        ? new RawSelectionTarget(parameters)
        : new PlainTarget({ ...parameters, isToken: false }),
    ];
  }

  protected abstract getContentRange(contentRange: Range): Range;
}

export class StartOfStage extends PositionStage {
  protected getContentRange(contentRange: Range): Range {
    return contentRange.start.toEmptyRange();
  }
}

export class EndOfStage extends PositionStage {
  protected getContentRange(contentRange: Range): Range {
    return contentRange.end.toEmptyRange();
  }
}
