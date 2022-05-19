import { Range, TextEditor } from "vscode";
import BaseTarget from "./BaseTarget";

interface NotebookCellTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
}

export default class NotebookCellTarget extends BaseTarget {
  constructor(parameters: NotebookCellTargetParameters) {
    super(parameters);
    this.scopeType = "notebookCell";
    this.delimiter = "\n";
  }
}
