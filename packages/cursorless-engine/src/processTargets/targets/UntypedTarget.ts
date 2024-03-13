import { Range } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import type { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "./util/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";

interface UntypedTargetParameters extends CommonTargetParameters {
  readonly hasExplicitRange: boolean;
  readonly isToken?: boolean;
}

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */
export class UntypedTarget extends BaseTarget<UntypedTargetParameters> {
  type = "UntypedTarget";
  insertionDelimiter = " ";
  hasExplicitScopeType = false;

  constructor(parameters: UntypedTargetParameters) {
    super(parameters);
    this.hasExplicitRange = parameters.hasExplicitRange;
    this.isToken = parameters.isToken ?? true;
  }

  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  async getRemovalRange(): Promise<Range> {
    // If this range is in the middle of a whitespace sequence we don't want to remove leading or trailing whitespaces.
    return (await this.editor.document.getText(this.contentRange)).trim()
      .length === 0
      ? this.contentRange
      : getTokenRemovalRange(this);
  }

  async maybeCreateRichRangeTarget(): Promise<null> {
    // It never makes sense to create a rich range target from an untyped
    // target. We let {@link createContinuousRangeTarget} handle constructing an
    // untyped range.
    return null;
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      isToken: this.isToken,
      hasExplicitRange: this.hasExplicitRange,
    };
  }
}
