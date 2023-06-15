import { Range } from "@cursorless/common";
import { tryConstructPlainTarget } from "../../util/tryConstructTarget";
import { getDelimitedSequenceRemovalRange } from "../targetUtil/insertionRemovalBehaviors/DelimitedSequenceInsertionRemovalBehavior";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export interface SubTokenTargetParameters extends CommonTargetParameters {
  readonly insertionDelimiter: string;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export default class SubTokenWordTarget extends BaseTarget<SubTokenTargetParameters> {
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

  protected getCloneParameters(): SubTokenTargetParameters {
    return {
      ...this.state,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: this.trailingDelimiterRange_,
      insertionDelimiter: this.insertionDelimiter,
    };
  }
}
