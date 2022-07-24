import { Range } from "vscode";
import { BaseTarget, CommonTargetParameters } from ".";
import { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";

interface UntypedRangeTargetParameters extends CommonTargetParameters {
  readonly hasExplicitRange: boolean;
}

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */
export default class UntypedRangeTarget extends BaseTarget {
  insertionDelimiter = " ";
  hasExplicitScopeType = false;

  constructor(parameters: UntypedRangeTargetParameters) {
    super(parameters);
    this.hasExplicitRange = parameters.hasExplicitRange;
  }

  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  getRemovalRange(): Range {
    // If the range is empty in a whitespace sequence we don't want to remove anything.
    return this.contentRange.isEmpty
      ? this.contentRange
      : getTokenRemovalRange(this);
  }

  protected getCloneParameters() {
    return this.state;
  }
}
