import { Range } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import { Target } from "../../typings/target.types";
import { getTokenRemovalRange } from "./PlainTarget";
import { getTokenTrailingDelimiterTarget } from "./PlainTarget";
import { getTokenLeadingDelimiterTarget } from "./PlainTarget";

export class TokenTarget extends BaseTarget<CommonTargetParameters> {
  type = "TokenTarget";
  insertionDelimiter = " ";

  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  getRemovalRange(): Range {
    return getTokenRemovalRange(this);
  }

  protected getCloneParameters() {
    return this.state;
  }
}
