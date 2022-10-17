import { Position, Range, TextEditor } from "vscode";
import type { Target } from "../../../typings/target.types";
import type {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../../typings/Types";
import type { ModifierStage } from "../../PipelineStages.types";
import { DocumentTarget } from "../../targets";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): DocumentTarget[] {
    return [
      new DocumentTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: getDocumentRange(target.editor),
      }),
    ];
  }
}

function getDocumentRange(editor: TextEditor) {
  return new Range(
    new Position(0, 0),
    editor.document.lineAt(editor.document.lineCount - 1).range.end,
  );
}
