import { Range, TextDocument } from "vscode";
import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { getDocumentRange } from "../../util/range";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection {
    return {
      ...selection,
      editor: selection.editor,
      isReversed: selection.isReversed,
      contentRange: getDocumentContentRange(selection.editor.document),
      removalRange: getDocumentRange(selection.editor.document),
      delimiter: "\n",
      interiorRange: undefined,
      boundary: undefined,
      leadingDelimiterRange: undefined,
      trailingDelimiterRange: undefined,
    };
  }
}

function getDocumentContentRange(document: TextDocument) {
  let firstLineNum = 0;
  let lastLineNum = document.lineCount - 1;

  for (let i = firstLineNum; i < document.lineCount; ++i) {
    if (!document.lineAt(i).isEmptyOrWhitespace) {
      break;
    }
    firstLineNum = i;
  }

  for (let i = lastLineNum; i > -1; --i) {
    if (!document.lineAt(i).isEmptyOrWhitespace) {
      break;
    }
    lastLineNum = i;
  }

  const firstLine = document.lineAt(firstLineNum);
  const lastLine = document.lineAt(lastLineNum);

  return new Range(firstLine.range.start, lastLine.range.end);
}
