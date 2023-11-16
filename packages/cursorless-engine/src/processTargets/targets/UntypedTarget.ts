import { Range } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import type { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "./util/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import { createContinuousRange } from "./util/createContinuousRange";

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
  getRemovalRange(): Range {
    // If this range is in the middle of a whitespace sequence we don't want to remove leading or trailing whitespaces.
    return this.editor.document.getText(this.contentRange).trim().length === 0
      ? this.contentRange
      : getTokenRemovalRange(this);
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    return createContinuousRangeUntypedTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd,
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      isToken: this.isToken,
      hasExplicitRange: this.hasExplicitRange,
    };
  }
}
export function createContinuousRangeUntypedTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): UntypedTarget {
  return new UntypedTarget({
    editor: startTarget.editor,
    isReversed,
    hasExplicitRange: true,
    contentRange: createContinuousRange(
      startTarget,
      endTarget,
      includeStart,
      includeEnd,
    ),
    isToken: startTarget.isToken && endTarget.isToken,
  });
}
