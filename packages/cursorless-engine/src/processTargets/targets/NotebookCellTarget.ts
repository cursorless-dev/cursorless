import { TargetPosition } from "@cursorless/common";
import {
  BaseTarget,
  CommonTargetParameters,
  removalUnsupportedForPosition,
} from ".";
import { Target } from "../../typings/target.types";

export default class NotebookCellTarget extends BaseTarget<CommonTargetParameters> {
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

  toPositionTarget(position: TargetPosition): Target {
    return new NotebookCellPositionTarget({
      ...this.state,
      thatTarget: this,
      position,
    });
  }
}

interface NotebookCellPositionTargetParameters extends CommonTargetParameters {
  readonly position: TargetPosition;
}

export class NotebookCellPositionTarget extends BaseTarget<NotebookCellPositionTargetParameters> {
  insertionDelimiter = "\n";
  isNotebookCell = true;
  public position: TargetPosition;

  constructor(parameters: NotebookCellPositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => removalUnsupportedForPosition(this.position);

  protected getCloneParameters(): NotebookCellPositionTargetParameters {
    return {
      ...this.state,
      position: this.position,
    };
  }
}
