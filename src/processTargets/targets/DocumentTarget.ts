import { Range, TextEditor } from "vscode";
import { EditNewLineContext, ScopeType } from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

interface DocumentTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
}

export default class DocumentTarget extends BaseTarget {
  scopeType: ScopeType;
  delimiter: string;
  isLine: boolean;

  constructor(parameters: DocumentTargetParameters) {
    super(parameters);
    this.scopeType = "document";
    this.delimiter = "\n";
    this.isLine = true;
  }

  protected getRemovalContentRange(): Range {
    if (this.position != null) {
      return this.contentRange;
    }
    return new Range(
      this.editor.document.lineAt(0).range.start,
      this.editor.document.lineAt(this.editor.document.lineCount - 1).range.end
    );
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position != null) {
      return undefined;
    }
    return this.contentRange;
  }
}
