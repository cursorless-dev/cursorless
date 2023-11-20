import { BaseTarget, CommonTargetParameters } from ".";
import type { Target } from "../../typings/target.types";
import {createContinuousRangeOrUntypedTarget} from "./UntypedTarget";

/**
 * A target that was not explicitly spoken by the user. For example:
 *
 * - The implicit destination in the command `"bring air"`
 * - The implicit anchor in the range `"take past air"`
 */
export class ImplicitTarget extends BaseTarget<CommonTargetParameters> {
  type = "ImplicitTarget";
  insertionDelimiter = "";
  isRaw = true;
  hasExplicitScopeType = false;
  isImplicit = true;
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
