import { BaseTarget, CommonTargetParameters } from "./BaseTarget";

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter will be
 * inherited from the source in the case of a bring after a bring before
 */
export class RawSelectionTarget extends BaseTarget<CommonTargetParameters> {
  type = "RawSelectionTarget";
  insertionDelimiter = "";
  isRaw = true;
  isToken = false;

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = async () => this.contentRange;

  protected getCloneParameters = () => this.state;
}
