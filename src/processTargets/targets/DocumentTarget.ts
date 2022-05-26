import { Range, TextEditor } from "vscode";
import { Target } from "../../typings/target.types";
import { fitRangeToLineContent } from "../modifiers/scopeTypeStages/LineStage";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";
import WeakTarget from "./WeakTarget";

export default class DocumentTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: "\n",
    });
  }

  get isLine() {
    return true;
  }

  getInteriorStrict(): Target[] {
    return [
      new WeakTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: getDocumentContentRange(this.editor),
      }),
    ];
  }

  cloneWith(parameters: CloneWithParameters): DocumentTarget {
    return new DocumentTarget({ ...this.state, ...parameters });
  }
}

function getDocumentContentRange(editor: TextEditor) {
  const { document } = editor;
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

  return fitRangeToLineContent(
    editor,
    new Range(firstLine.range.start, lastLine.range.end)
  );
}
