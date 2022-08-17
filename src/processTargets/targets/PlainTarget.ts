import BaseTarget from "./BaseTarget";

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter is empty string.
 */
export default class PlainTarget extends BaseTarget {
  insertionDelimiter = "";

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters = () => this.state;
}
