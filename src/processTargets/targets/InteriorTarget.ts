import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class InteriorTarget extends BaseTarget {
  insertionDelimiter = "";

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get contentRange() {
    return shrinkRangeToFitContent(this.editor, this.state.contentRange);
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.state.contentRange;

  protected getCloneParameters() {
    return this.state;
  }
}
