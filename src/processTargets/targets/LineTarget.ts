import { Position, Range } from "vscode";
import { Target, TargetType } from "../../typings/target.types";
import { createContinuousLineRange } from "../targetUtil/createContinuousRange";
import {
  getLineLeadingDelimiterRange,
  getLineTrailingDelimiterRange,
} from "../targetUtil/getLineDelimiters";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

export default class LineTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get type(): TargetType {
    return "line";
  }
  get delimiterString() {
    return "\n";
  }
  get isLine() {
    return true;
  }

  protected get contentRemovalRange() {
    return new Range(
      new Position(this.contentRange.start.line, 0),
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
  }

  getLeadingDelimiterTarget() {
    return getLineLeadingDelimiterRange(this.editor, this.contentRemovalRange);
  }

  getTrailingDelimiterTarget() {
    return getLineTrailingDelimiterRange(this.editor, this.contentRemovalRange);
  }

  getRemovalHighlightRange() {
    return this.contentRange;
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (endTarget.isLine) {
      return this.withContentRange(
        createContinuousLineRange(this, endTarget, includeStart, includeEnd)
      );
    }

    return createContinuousRangeWeakTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected getCloneParameters() {
    return this.state;
  }
}
