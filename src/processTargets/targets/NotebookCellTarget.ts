import { TextEditor } from "vscode";
import { EditNewLineContext } from "../../typings/target.types";
import { getNotebookFromCellDocument } from "../../util/notebook";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class NotebookCellTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...parameters,
      scopeType: "notebookCell",
      delimiter: "\n",
    });
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

  clone(): NotebookCellTarget {
    return new NotebookCellTarget(this.state);
  }
}
