import { TextEditor } from "vscode";
import { EditNewContext } from "../../typings/target.types";
import { getNotebookFromCellDocument } from "../../util/notebook";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
} from "./BaseTarget";

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

  cloneWith(parameters: CloneWithParameters): NotebookCellTarget {
    return new NotebookCellTarget({ ...this.state, ...parameters });
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }
}
