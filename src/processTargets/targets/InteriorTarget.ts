import { Range } from "vscode";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export interface InteriorTargetParameters
  extends Omit<CommonTargetParameters, "contentRange"> {
  readonly fullInteriorRange: Range;
}

export default class InteriorTarget extends BaseTarget {
  insertionDelimiter = "";
  private readonly fullInteriorRange: Range;

  constructor(parameters: InteriorTargetParameters) {
    super({
      ...parameters,
      contentRange: shrinkRangeToFitContent(
        parameters.editor,
        parameters.fullInteriorRange
      ),
    });
    this.fullInteriorRange = parameters.fullInteriorRange;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.fullInteriorRange;

  protected getCloneParameters() {
    return {
      ...this.state,
      fullInteriorRange: this.fullInteriorRange,
    };
  }
}
