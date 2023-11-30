import { Range } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import { tryConstructPlainTarget } from "../../util/tryConstructTarget";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import { getDelimitedSequenceRemovalRange } from "../targetUtil/insertionRemovalBehaviors/DelimitedSequenceInsertionRemovalBehavior";

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

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: SubTokenWordTarget,
  ): SubTokenWordTarget {
    return new SubTokenWordTarget({
      ...this.getCloneParameters(),
      isReversed,
      contentRange: createContinuousRange(this, endTarget, true, true),
      trailingDelimiterRange: endTarget.trailingDelimiterRange_,
    });
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
