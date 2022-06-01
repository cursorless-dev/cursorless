import { Range } from "vscode";
import { Target } from "../../typings/target.types";
import { isSameType } from "../../util/typeUtils";
import { constructPlainTarget } from "../../util/wrapRangeWithTarget";
import {
  createContinuousRange,
  createContinuousRangeFromRanges,
} from "../targetUtil/createContinuousRange";
import { getDelimitedSequenceRemovalRange } from "../targetUtil/insertionRemovalBehaviors/DelimitedSequenceInsertionRemovalBehavior";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import ScopeTypeTarget from "./ScopeTypeTarget";

export interface SubTokenTargetParameters extends CommonTargetParameters {
  readonly delimiterString: string;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export default class SubTokenTarget extends BaseTarget {
  private leadingDelimiterRange_?: Range;
  private trailingDelimiterRange_?: Range;
  delimiterString: string;

  constructor(parameters: SubTokenTargetParameters) {
    super(parameters);
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.delimiterString = parameters.delimiterString;
  }

  getLeadingDelimiterTarget() {
    return constructPlainTarget(
      this.editor,
      this.leadingDelimiterRange_,
      this.isReversed
    );
  }

  getTrailingDelimiterTarget() {
    return constructPlainTarget(
      this.editor,
      this.trailingDelimiterRange_,
      this.isReversed
    );
  }

  getRemovalRange(): Range {
    return getDelimitedSequenceRemovalRange(this);
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (isSameType(this, endTarget)) {
      const scopeTarget = <ScopeTypeTarget>endTarget;
      if (this.scopeTypeType_ === scopeTarget.scopeTypeType_) {
        const contentRemovalRange =
          this.contentRemovalRange_ != null ||
          scopeTarget.contentRemovalRange_ != null
            ? createContinuousRangeFromRanges(
                this.contentRemovalRange_ ?? this.contentRange,
                scopeTarget.contentRemovalRange_ ?? scopeTarget.contentRange,
                includeStart,
                includeEnd
              )
            : undefined;

        return new ScopeTypeTarget({
          ...this.getCloneParameters(),
          isReversed,
          leadingDelimiterRange: this.leadingDelimiterRange_,
          trailingDelimiterRange: scopeTarget.trailingDelimiterRange_,
          removalRange: contentRemovalRange,
          contentRange: createContinuousRange(
            this,
            endTarget,
            includeStart,
            includeEnd
          ),
        });
      }
    }

    return super.createContinuousRangeTarget(
      isReversed,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: this.trailingDelimiterRange_,
    };
  }
}
