import { EnforceUndefined } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";

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

  protected getCloneParameters: () => EnforceUndefined<CommonTargetParameters> =
    () => this.state;
}
