import { Range } from "vscode";
import { TargetType } from "../../typings/target.types";
import { addLineDelimiterRanges } from "../targetUtil/getLineDelimiters";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

interface DelimiterRangeTargetParameters extends CommonTargetParameters {
  readonly isLine: boolean;
}

export default class DelimiterRangeTarget extends BaseTarget {
  private isLine_: boolean;

  constructor(parameters: DelimiterRangeTargetParameters) {
    super(parameters);
    this.isLine_ = parameters.isLine;
  }

  get type(): TargetType {
    return "delimiterRange";
  }
  get delimiterString() {
    return " ";
  }
  get isLine() {
    return this.isLine_;
  }
  getLeadingDelimiterTarget() {
    return undefined;
  }
  getTrailingDelimiterTarget() {
    return undefined;
  }

  getRemovalRange(): Range {
    return this.isLine
      ? addLineDelimiterRanges(this.editor, this.contentRange)
      : this.contentRange;
  }

  getRemovalHighlightRange(): Range {
    return this.contentRange;
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      isLine: this.isLine_,
    };
  }
}
