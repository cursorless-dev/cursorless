import { CommonTargetParameters } from ".";
import { CommonTarget } from "./UntypedTarget";

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter will be
 * inherited from the source in the case of a bring after a bring before
 */
export class RawSelectionTarget extends CommonTarget<CommonTargetParameters> {
  type = "RawSelectionTarget";
  insertionDelimiter = "";
  isRaw = true;
  isToken = false;

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters = () => this.state;
}
