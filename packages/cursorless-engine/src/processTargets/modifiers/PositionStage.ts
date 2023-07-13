import { Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";
import {
  CommonTargetParameters,
  PlainTarget,
  RawSelectionTarget,
} from "../targets";

abstract class StartEndOfStage implements ModifierStage {
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

export class StartOfStage extends StartEndOfStage {
  protected getContentRange(contentRange: Range): Range {
    return contentRange.start.toEmptyRange();
  }
}

export class EndOfStage extends StartEndOfStage {
  protected getContentRange(contentRange: Range): Range {
    return contentRange.end.toEmptyRange();
  }
}
