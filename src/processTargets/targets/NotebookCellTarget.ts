import type { TextEditor } from "vscode";
import type { Target } from "../../typings/target.types";
import type { Position } from "../../typings/targetDescriptor.types";
import { getNotebookFromCellDocument } from "../../util/notebook";
import type { CommonTargetParameters } from "./BaseTarget";
import BaseTarget from "./BaseTarget";
import { removalUnsupportedForPosition } from "./PositionTarget";

export default class NotebookCellTarget extends BaseTarget {
  insertionDelimiter = "\n";
  isNotebookCell = true;

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters() {
    return this.state;
  }

  toPositionTarget(position: Position): Target {
    return new NotebookCellPositionTarget({
      ...this.state,
      thatTarget: this,
      position,
    });
  }
}

interface NotebookCellPositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
}

export class NotebookCellPositionTarget extends BaseTarget {
  insertionDelimiter = "\n";
  isNotebookCell = true;
  private position: Position;

  constructor(parameters: NotebookCellPositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => removalUnsupportedForPosition(this.position);

  getEditNewCommand(): string {
    if (this.isNotebookEditor(this.editor)) {
      return this.position === "before"
        ? "notebook.cell.insertCodeCellAbove"
        : "notebook.cell.insertCodeCellBelow";
    }

    return this.position === "before"
      ? "jupyter.insertCellAbove"
      : "jupyter.insertCellBelow";
  }

  protected getCloneParameters(): NotebookCellPositionTargetParameters {
    return {
      ...this.state,
      position: this.position,
    };
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }
}
