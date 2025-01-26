import type { Range } from "@cursorless/common";
import type {
  JoinAsType,
  Target,
  TextualType,
} from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "./util/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";

export class TokenTarget extends BaseTarget<CommonTargetParameters> {
  type = "TokenTarget";
  textualType: TextualType = "token";
  joinAs: JoinAsType = "token";
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
