import { Range } from "vscode";
import { SimpleScopeTypeType, Target } from "../../typings/target.types";
import { isSameType } from "../../util/typeUtils";
import {
  createContinuousRange,
  createContinuousRangeFromRanges,
} from "../targetUtil/createContinuousRange";
import { getDelimitedSequenceRemovalRange } from "../targetUtil/insertionRemovalBehaviors/DelimitedSequenceInsertionRemovalBehavior";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import PlainTarget from "./PlainTarget";

export interface ScopeTypeTargetParameters extends CommonTargetParameters {
  readonly scopeTypeType: SimpleScopeTypeType;
  readonly delimiter?: string;
  readonly removalRange?: Range;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export default class ScopeTypeTarget extends BaseTarget {
  private scopeTypeType_: SimpleScopeTypeType;
  private removalRange_?: Range;
  private leadingDelimiterRange_?: Range;
  private trailingDelimiterRange_?: Range;
  private hasDelimiterRange_: boolean;
  insertionDelimiter: string;

  constructor(parameters: ScopeTypeTargetParameters) {
    super(parameters);
    this.scopeTypeType_ = parameters.scopeTypeType;
    this.removalRange_ = parameters.removalRange;
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.insertionDelimiter =
      parameters.delimiter ?? getDelimiter(parameters.scopeTypeType);
    this.hasDelimiterRange_ =
      !!this.leadingDelimiterRange_ || !!this.trailingDelimiterRange_;
  }

  getLeadingDelimiterTarget(): Target | undefined {
    if (this.leadingDelimiterRange_ != null) {
      return new PlainTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: this.leadingDelimiterRange_,
      });
    }
    if (!this.hasDelimiterRange_) {
      return getTokenLeadingDelimiterTarget(this);
    }
    return undefined;
  }

  getTrailingDelimiterTarget(): Target | undefined {
    if (this.trailingDelimiterRange_ != null) {
      return new PlainTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: this.trailingDelimiterRange_,
      });
    }
    if (!this.hasDelimiterRange_) {
      return getTokenTrailingDelimiterTarget(this);
    }
    return undefined;
  }

  getRemovalRange(): Range {
    return this.removalRange_ != null
      ? getTokenRemovalRange(this, this.removalRange_)
      : this.hasDelimiterRange_
      ? getDelimitedSequenceRemovalRange(this)
      : getTokenRemovalRange(this);
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
          this.removalRange_ != null || scopeTarget.removalRange_ != null
            ? createContinuousRangeFromRanges(
                this.removalRange_ ?? this.contentRange,
                scopeTarget.removalRange_ ?? scopeTarget.contentRange,
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
      scopeTypeType: this.scopeTypeType_,
      contentRemovalRange: this.removalRange_,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: this.trailingDelimiterRange_,
    };
  }
}

function getDelimiter(scopeType: SimpleScopeTypeType): string {
  switch (scopeType) {
    case "anonymousFunction":
    case "statement":
    case "ifStatement":
      return "\n";
    case "class":
    case "namedFunction":
      return "\n\n";
    default:
      return " ";
  }
}
