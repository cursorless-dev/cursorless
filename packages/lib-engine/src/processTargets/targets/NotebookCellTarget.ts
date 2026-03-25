import type { InsertionMode } from "@cursorless/lib-common";
import type { Destination } from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import { NotebookCellDestination } from "./NotebookCellDestination";

export class NotebookCellTarget extends BaseTarget<CommonTargetParameters> {
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

  toDestination(insertionMode: InsertionMode): Destination {
    return new NotebookCellDestination(this, insertionMode);
  }
}
