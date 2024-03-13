import { InsertionMode } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import { Destination } from "../../typings/target.types";
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
  getRemovalRange = async () => this.contentRange;

  protected getCloneParameters() {
    return this.state;
  }

  async toDestination(insertionMode: InsertionMode): Promise<Destination> {
    return new NotebookCellDestination(this, insertionMode);
  }
}
