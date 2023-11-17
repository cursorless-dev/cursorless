import { BaseTarget, CommonTargetParameters } from ".";
import type { Target } from "../../typings/target.types";
import { createContinuousRangeOrUntypedTarget } from "../targetUtil/createContinuousRange";

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

  protected getCloneParameters = () => this.state;
}
