import { EndOfModifier, Range, StartOfModifier } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";
import { CommonTargetParameters, RawSelectionTarget } from "../targets";

abstract class StartEndOfStage implements ModifierStage {
  run(target: Target): Target[] {
    const parameters: CommonTargetParameters = {
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: this.constructContentRange(target.contentRange),
    };

    return [new RawSelectionTarget(parameters)];
  }

  protected abstract constructContentRange(contentRange: Range): Range;
}

export class StartOfStage extends StartEndOfStage {
  constructor(_modifier: StartOfModifier) {
    super();
  }

  protected constructContentRange(contentRange: Range): Range {
    return contentRange.start.toEmptyRange();
  }
}

export class EndOfStage extends StartEndOfStage {
  constructor(_modifier: EndOfModifier) {
    super();
  }

  protected constructContentRange(contentRange: Range): Range {
    return contentRange.end.toEmptyRange();
  }
}
