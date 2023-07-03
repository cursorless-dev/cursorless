import { BaseTarget, CommonTargetParameters } from ".";

interface PlainTargetParameters extends CommonTargetParameters {
  readonly isToken?: boolean;
}

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter is empty string.
 */
export default class PlainTarget extends BaseTarget<PlainTargetParameters> {
  insertionDelimiter = "";

  constructor(parameters: PlainTargetParameters) {
    super(parameters);
    this.isToken = parameters.isToken ?? true;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters() {
    return {
      ...this.state,
      isToken: this.isToken,
    };
  }
}
