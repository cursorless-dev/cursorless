import { InsertionMode } from "@cursorless/common";
import { CommonTargetParameters } from ".";
import { Destination } from "../../typings/target.types";
import { NotebookCellDestination } from "./NotebookCellDestination";
import { CommonTarget } from "./UntypedTarget";

export class NotebookCellTarget extends CommonTarget<CommonTargetParameters> {
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
