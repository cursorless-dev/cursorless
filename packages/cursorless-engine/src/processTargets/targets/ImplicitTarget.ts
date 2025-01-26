import type { EnforceUndefined } from "@cursorless/common";
import type { TargetType } from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";

/**
 * A target that was not explicitly spoken by the user. For example:
 *
 * - The implicit destination in the command `"bring air"`
 * - The implicit anchor in the range `"take past air"`
 */
export class ImplicitTarget extends BaseTarget<CommonTargetParameters> {
  instanceType = "ImplicitTarget";
  type: TargetType = "character";
  insertionDelimiter = "";
  isRaw = true;
  hasExplicitScopeType = false;
  isImplicit = true;

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters: () => EnforceUndefined<CommonTargetParameters> =
    () => this.state;
}
