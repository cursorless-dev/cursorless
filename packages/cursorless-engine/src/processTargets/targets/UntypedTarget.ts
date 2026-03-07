import type { Range } from "@cursorless/common";
import type { Target, TextualType } from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "./util/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";

interface UntypedTargetParameters extends CommonTargetParameters {
  readonly hasExplicitRange: boolean;
  readonly textualType?: TextualType;
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
    this.textualType = parameters.textualType ?? "token";
  }

  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  getRemovalRange(): Range {
    // If this range is in the middle of a whitespace sequence we don't want to remove leading or trailing whitespaces.
    return this.editor.document.getText(this.contentRange).trim().length === 0
      ? this.contentRange
      : getTokenRemovalRange(this);
  }

  maybeCreateRichRangeTarget(): null {
    // It never makes sense to create a rich range target from an untyped
    // target. We let {@link createContinuousRangeTarget} handle constructing an
    // untyped range.
    return null;
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      textualType: this.textualType,
      hasExplicitRange: this.hasExplicitRange,
    };
  }
}
