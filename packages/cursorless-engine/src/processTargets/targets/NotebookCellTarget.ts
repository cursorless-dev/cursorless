import { InsertionMode } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from ".";
import { Destination } from "../../typings/target.types";
import { NotebookCellDestination } from "./NotebookCellDestination";
import type { Target } from "../../typings/target.types";
import { createContinuousRangeOrUntypedTarget } from "../targetUtil/createContinuousRange";

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

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    return createContinuousRangeOrUntypedTarget(
      isReversed,
      this,
      this.getCloneParameters(),
      endTarget,
      includeStart,
      includeEnd,
    );
  }

  protected getCloneParameters() {
    return this.state;
  }

  toDestination(insertionMode: InsertionMode): Destination {
    return new NotebookCellDestination(this, insertionMode);
  }
}
