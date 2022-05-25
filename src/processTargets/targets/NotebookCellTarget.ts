import { TextEditor } from "vscode";
import { EditNewContext, Position } from "../../typings/target.types";
import { getNotebookFromCellDocument } from "../../util/notebook";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class NotebookCellTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...parameters,
      delimiter: "\n",
    });
  }

  getEditNewContext(isBefore: boolean): EditNewContext {
    if (this.isNotebookEditor(this.editor)) {
      return {
        type: "command",
        command: isBefore
          ? "notebook.cell.insertCodeCellAbove"
          : "notebook.cell.insertCodeCellBelow",
      };
    }
    return {
      type: "command",
      command: isBefore ? "jupyter.insertCellAbove" : "jupyter.insertCellBelow",
    };
  }

  withPosition(position: Position): NotebookCellTarget {
    return new NotebookCellTarget({ ...this.state, position });
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }
}
