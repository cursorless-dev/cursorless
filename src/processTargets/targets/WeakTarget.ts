import { Range } from "vscode";
import { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import BaseTarget from "./BaseTarget";

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */
export default class WeakTarget extends BaseTarget {
  insertionDelimiter = " ";
  isWeak = true;

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
