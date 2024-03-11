import { Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";
import {
  CommonTargetParameters,
  PlainTarget,
  RawSelectionTarget,
} from "../targets";

abstract class PositionStage implements ModifierStage {
  async run(target: Target): Promise<Target[]> {
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
