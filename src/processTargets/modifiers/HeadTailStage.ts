import { Position, Range, TextEditor } from "vscode";
import { Target } from "../../typings/target.types";
import {
  HeadModifier,
  TailModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import TokenTarget from "../targets/TokenTarget";

abstract class HeadTailStage implements ModifierStage {
  abstract update(editor: TextEditor, range: Range): Range;

  constructor(private isReversed: boolean) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const contentRange = this.update(target.editor, target.contentRange);
    return [
      new TokenTarget({
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

  update(editor: TextEditor, range: Range) {
    return new Range(new Position(range.start.line, 0), range.end);
  }
}

export class TailStage extends HeadTailStage {
  constructor(private modifier: TailModifier) {
    super(false);
  }

  update(editor: TextEditor, range: Range) {
    return new Range(range.start, editor.document.lineAt(range.end).range.end);
  }
}
