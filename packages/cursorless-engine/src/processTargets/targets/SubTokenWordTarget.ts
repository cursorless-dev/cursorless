import { Range } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from ".";
import { Target } from "../../typings/target.types";
import { tryConstructPlainTarget } from "../../util/tryConstructTarget";
import { isSameType } from "../../util/typeUtils";
import { createContinuousRange } from "./util/createContinuousRange";
import { getDelimitedSequenceRemovalRange } from "./util/insertionRemovalBehaviors/DelimitedSequenceInsertionRemovalBehavior";

export interface SubTokenTargetParameters extends CommonTargetParameters {
  readonly insertionDelimiter: string;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export class SubTokenWordTarget extends BaseTarget<SubTokenTargetParameters> {
  type = "SubTokenWordTarget";
  private leadingDelimiterRange_?: Range;
  private trailingDelimiterRange_?: Range;
  insertionDelimiter: string;
  isToken = false;
  isWord = true;

  constructor(parameters: SubTokenTargetParameters) {
    super(parameters);
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.insertionDelimiter = parameters.insertionDelimiter;
  }

  getLeadingDelimiterTarget() {
    return tryConstructPlainTarget(
      this.editor,
      this.leadingDelimiterRange_,
      this.isReversed,
    );
  }

  getTrailingDelimiterTarget() {
    return tryConstructPlainTarget(
      this.editor,
      this.trailingDelimiterRange_,
      this.isReversed,
    );
  }

  getRemovalRange(): Range {
    return getDelimitedSequenceRemovalRange(this);
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    if (isSameType(this, endTarget)) {
      return new SubTokenWordTarget({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd,
        ),
        trailingDelimiterRange: endTarget.trailingDelimiterRange_,
      });
    }

    return super.createContinuousRangeTarget(
      isReversed,
      endTarget,
      includeStart,
      includeEnd,
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: this.trailingDelimiterRange_,
      insertionDelimiter: this.insertionDelimiter,
    };
  }
}
