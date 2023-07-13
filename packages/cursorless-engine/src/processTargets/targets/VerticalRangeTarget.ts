import { BaseTarget, CommonTargetParameters } from ".";

interface VerticalRangeTargetParameters extends CommonTargetParameters {
  readonly insertionDelimiter: string;
}

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter is given by argument.
 */
export default class VerticalRangeTarget extends BaseTarget<VerticalRangeTargetParameters> {
  type = "VerticalRangeTarget";
  isToken = false;
  insertionDelimiter: string;

  constructor(parameters: VerticalRangeTargetParameters) {
    super(parameters);
    this.insertionDelimiter = parameters.insertionDelimiter;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters() {
    return {
      ...this.state,
      insertionDelimiter: this.insertionDelimiter,
    };
  }
}
