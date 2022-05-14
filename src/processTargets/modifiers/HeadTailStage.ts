import { Position, Range, TextEditor } from "vscode";
import { HeadModifier, TailModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

abstract class HeadTailStage implements ModifierStage {
  abstract update(editor: TextEditor, range: Range): Range;

  constructor(private isReversed: boolean) {}

  run(
    context: ProcessedTargetsContext,
    stage: HeadModifier | TailModifier,
    selection: TypedSelection
  ): TypedSelection {
    return {
      ...selection,
      isReversed: this.isReversed,
      contentRange: this.update(selection.editor, selection.contentRange),
      interiorRange: selection.interiorRange
        ? this.update(selection.editor, selection.interiorRange)
        : undefined,
    };
  }
}

export class HeadStage extends HeadTailStage {
  constructor() {
    super(true);
  }
  update(editor: TextEditor, range: Range) {
    return new Range(new Position(range.start.line, 0), range.end);
  }
}

export class TailStage extends HeadTailStage {
  constructor() {
    super(false);
  }
  update(editor: TextEditor, range: Range) {
    return new Range(range.start, editor.document.lineAt(range.end).range.end);
  }
}
