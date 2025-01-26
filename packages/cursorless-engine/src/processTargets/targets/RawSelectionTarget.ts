import type { EnforceUndefined } from "@cursorless/common";
import type { TargetType } from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter will be
 * inherited from the source in the case of a bring after a bring before
 */
export class RawSelectionTarget extends BaseTarget<CommonTargetParameters> {
  instanceType = "RawSelectionTarget";
  type: TargetType = "character";
  insertionDelimiter = "";
  isRaw = true;

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters: () => EnforceUndefined<CommonTargetParameters> =
    () => this.state;
}
