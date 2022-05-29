import { Range } from "vscode";
import { Target, TargetType } from "../../typings/target.types";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import { addLineDelimiterRanges } from "../targetUtil/getLineDelimiters";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
} from "./BaseTarget";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

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
  get delimiter() {
    return " ";
  }
  get isLine() {
    return this.isLine_;
  }
  getLeadingDelimiterRange() {
    return undefined;
  }
  getTrailingDelimiterRange() {
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

  cloneWith(parameters: CloneWithParameters) {
    return new DelimiterRangeTarget({
      ...this.getCloneParameters(),
      ...parameters,
    });
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (this.isSameType(endTarget)) {
      return new DelimiterRangeTarget({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
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
    return {
      ...this.state,
      isLine: this.isLine_,
    };
  }
}
