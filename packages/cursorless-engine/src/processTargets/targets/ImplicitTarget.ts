import type { CommonTargetParameters } from "./BaseTarget";
import BaseTarget from "./BaseTarget";

/**
 * A target that was not explicitly spoken by the user. For example:
 *
 * - The implicit destination in the command `"bring air"`
 * - The implicit anchor in the range `"take past air"`
 */
export default class ImplicitTarget extends BaseTarget<CommonTargetParameters> {
  insertionDelimiter = "";
  isRaw = true;
  hasExplicitScopeType = false;
  isImplicit = true;
  isToken = false;

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters = () => this.state;
}
