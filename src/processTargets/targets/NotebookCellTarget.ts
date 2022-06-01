import { TextEditor } from "vscode";
import { EditNewContext } from "../../typings/target.types";
import { getNotebookFromCellDocument } from "../../util/notebook";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class NotebookCellTarget extends BaseTarget {
  insertionDelimiter = "\n";

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  getEditNewContext(isBefore: boolean): EditNewContext {
    if (this.isNotebookEditor(this.editor)) {
      return {
        type: "command",
        dontUpdateSelection: true,
        command: isBefore
          ? "notebook.cell.insertCodeCellAbove"
          : "notebook.cell.insertCodeCellBelow",
      };
    }
    return {
      type: "command",
      dontUpdateSelection: true,
      command: isBefore ? "jupyter.insertCellAbove" : "jupyter.insertCellBelow",
    };
  }

  protected getCloneParameters() {
    return this.state;
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }
}
