import { Range, TextDocument } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { getDocumentRange } from "../../util/range";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    return {
      editor: target.editor,
      isReversed: target.isReversed,
      delimiter: "\n",
      contentRange: getDocumentContentRange(target.editor.document),
      removalRange: getDocumentRange(target.editor.document),
    };
  }
}

function getDocumentContentRange(document: TextDocument) {
  let firstLineNum = 0;
  let lastLineNum = document.lineCount - 1;

  for (let i = firstLineNum; i < document.lineCount; ++i) {
    if (!document.lineAt(i).isEmptyOrWhitespace) {
      firstLineNum = i;
      break;
    }
  }

  for (let i = lastLineNum; i > -1; --i) {
    if (!document.lineAt(i).isEmptyOrWhitespace) {
      lastLineNum = i;
      break;
    }
  }

  const firstLine = document.lineAt(firstLineNum);
  const lastLine = document.lineAt(lastLineNum);

  return new Range(firstLine.range.start, lastLine.range.end);
}
