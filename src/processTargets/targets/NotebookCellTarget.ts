import { Range, TextEditor } from "vscode";
import { EditNewLineContext } from "../../typings/target.types";
import { getNotebookFromCellDocument } from "../../util/notebook";
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

  getEditNewLineContext(isBefore: boolean): EditNewLineContext {
    if (this.isNotebookEditor(this.editor)) {
      return {
        command: isBefore
          ? "notebook.cell.insertCodeCellAbove"
          : "notebook.cell.insertCodeCellBelow",
      };
    }
    return {
      command: isBefore ? "jupyter.insertCellAbove" : "jupyter.insertCellBelow",
    };
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }
}
