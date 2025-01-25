import type { InsertionMode } from "@cursorless/common";
import type { Destination, TargetType } from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import { NotebookCellDestination } from "./NotebookCellDestination";

export class NotebookCellTarget extends BaseTarget<CommonTargetParameters> {
  instanceType = "NotebookCellTarget";
  type: TargetType = "notebookCell";
  insertionDelimiter = "\n";

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters() {
    return this.state;
  }

  toDestination(insertionMode: InsertionMode): Destination {
    return new NotebookCellDestination(this, insertionMode);
  }
}
