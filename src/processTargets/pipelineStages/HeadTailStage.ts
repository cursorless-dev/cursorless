import { Position, Range, TextEditor, window } from "vscode";
import { HeadModifier, TailModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

abstract class HeadTailStage implements PipelineStage {
  abstract update(editor: TextEditor, range: Range): Range;

  constructor(private isReversed: boolean) {}

  run(
    context: ProcessedTargetsContext,
    stage: HeadModifier | TailModifier,
    selection: TypedSelection
  ): TypedSelection | TypedSelection[] {
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
