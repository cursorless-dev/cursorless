import { Range } from "@cursorless/common";
import { BaseTarget, MinimumTargetParameters, CommonTargetParameters } from ".";
import type { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import { isSameType } from "../../util/typeUtils";

/**
 * An abstract target base class who createContinueRangeTarget method returns either
 * a createContinuousRange if this and endTarget have the same type or
 * otherwise returns an UntypedTarget from this to endTarget.
 */
export abstract class CommonTarget<
  in out TParameters extends MinimumTargetParameters,
> extends BaseTarget<TParameters> {
  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    return createContinuousRangeOrUntypedTarget(
      isReversed,
      this,
      this.getCloneParameters(),
      endTarget,
      includeStart,
      includeEnd,
    );
  }
}

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

export function createContinuousRangeOrUntypedTarget(
  isReversed: boolean,
  startTarget: Target,
  cloneParameters: any,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean,
): Target {
  if (isSameType(startTarget, endTarget)) {
    const constructor = Object.getPrototypeOf(startTarget).constructor;

    return new constructor({
      ...cloneParameters,
      isReversed,
      contentRange: createContinuousRange(
        startTarget,
        endTarget,
        includeStart,
        includeEnd,
      ),
    });
  }

  return createContinuousRangeUntypedTarget(
    isReversed,
    startTarget,
    endTarget,
    includeStart,
    includeEnd,
  );
}
