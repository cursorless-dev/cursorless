import { InsertionMode } from "@cursorless/common";
import {
  BaseTarget,
  CommonTargetParameters,
  removalUnsupportedForPosition,
} from ".";
import { Target } from "../../typings/target.types";

export default class NotebookCellTarget extends BaseTarget<CommonTargetParameters> {
  type = "NotebookCellTarget";
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

  toPositionTarget(insertionMode: InsertionMode): Target {
    return new NotebookCellPositionTarget({
      ...this.state,
      thatTarget: this,
      insertionMode,
    });
  }
}

interface NotebookCellPositionTargetParameters extends CommonTargetParameters {
  readonly insertionMode: InsertionMode;
}

export class NotebookCellPositionTarget extends BaseTarget<NotebookCellPositionTargetParameters> {
  type = "NotebookCellPositionTarget";
  insertionDelimiter = "\n";
  isNotebookCell = true;
  public insertionMode: InsertionMode;

  constructor(parameters: NotebookCellPositionTargetParameters) {
    super(parameters);
    this.insertionMode = parameters.insertionMode;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => removalUnsupportedForPosition(this.insertionMode);

  protected getCloneParameters(): NotebookCellPositionTargetParameters {
    return {
      ...this.state,
      insertionMode: this.insertionMode,
    };
  }
}
