import { Range, TextEditor } from "vscode";
import { Target } from "../../typings/target.types";
import {
  HeadModifier,
  TailModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import PlainTarget from "../targets/PlainTarget";
import { toLineTarget } from "./scopeTypeStages/LineStage";

abstract class HeadTailStage implements ModifierStage {
  abstract update(
    editor: TextEditor,
    previousRange: Range,
    nextRange: Range
  ): Range;

  constructor(private isReversed: boolean) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { previousRange, nextRange } = (() => {
      if (target.previousTarget != null) {
        return {
          previousRange: target.previousTarget.contentRange,
          nextRange: target.contentRange,
        };
      }
      return {
        previousRange: target.contentRange,
        nextRange: toLineTarget(target).contentRange,
      };
    })();

    const contentRange = this.update(target.editor, previousRange, nextRange);
    return [
      new PlainTarget({
        editor: target.editor,
        isReversed: this.isReversed,
        contentRange,
      }),
    ];
  }
}

export class HeadStage extends HeadTailStage {
  constructor(private modifier: HeadModifier) {
    super(true);
  }

  update(editor: TextEditor, previousRange: Range, nextRange: Range) {
    return new Range(nextRange.start, previousRange.end);
  }
}

export class TailStage extends HeadTailStage {
  constructor(private modifier: TailModifier) {
    super(false);
  }

  update(editor: TextEditor, previousRange: Range, nextRange: Range) {
    return new Range(previousRange.start, nextRange.end);
  }
}
