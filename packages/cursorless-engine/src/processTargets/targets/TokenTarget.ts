import { Range } from "@cursorless/common";
import { BaseTarget } from ".";
import { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import type { CommonTargetParameters } from "./BaseTarget";

export default class TokenTarget extends BaseTarget<CommonTargetParameters> {
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
