import { Range, TextEditor } from "vscode";
import { TargetType } from "../../typings/target.types";
import { fitRangeToLineContent } from "../modifiers/scopeTypeStages/LineStage";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import WeakTarget from "./WeakTarget";

export default class DocumentTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get type(): TargetType {
    return "document";
  }
  get delimiter() {
    return "\n";
  }
  get isLine() {
    return true;
  }

  getLeadingDelimiterRange() {
    return undefined;
  }
  getTrailingDelimiterRange() {
    return undefined;
  }

  getInteriorStrict() {
    return [
      new WeakTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: getDocumentContentRange(this.editor),
      }),
    ];
  }

  protected getCloneParameters() {
    return this.state;
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
