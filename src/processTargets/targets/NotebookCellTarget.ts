import { TextEditor } from "vscode";
import { getNotebookFromCellDocument } from "../../util/notebook";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class NotebookCellTarget extends BaseTarget {
  insertionDelimiter = "\n";
  isNotebookCell = true;

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  getEditNewCommand(isBefore: boolean): string {
    if (this.isNotebookEditor(this.editor)) {
      return isBefore
        ? "notebook.cell.insertCodeCellAbove"
        : "notebook.cell.insertCodeCellBelow";
    }
    return isBefore ? "jupyter.insertCellAbove" : "jupyter.insertCellBelow";
  }

  protected getCloneParameters() {
    return this.state;
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }
}
