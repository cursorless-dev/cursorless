import { Range } from "vscode";
import { SimpleScopeTypeType, Target } from "../../typings/target.types";
import { isSameType } from "../../util/typeUtils";
import {
  createContinuousRange,
  createContinuousRangeFromRanges,
} from "../targetUtil/createContinuousRange";
import {
  getTokenLeadingDelimiterTarget,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import PlainTarget from "./PlainTarget";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

export interface ScopeTypeTargetParameters extends CommonTargetParameters {
  readonly scopeTypeType: SimpleScopeTypeType;
  readonly delimiter?: string;
  readonly contentRemovalRange?: Range;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export default class ScopeTypeTarget extends BaseTarget {
  private scopeTypeType_: SimpleScopeTypeType;
  private contentRemovalRange_?: Range;
  private leadingDelimiterRange_?: Range;
  private trailingDelimiterRange_?: Range;
  private hasDelimiterRange_: boolean;
  delimiterString: string;

  constructor(parameters: ScopeTypeTargetParameters) {
    super(parameters);
    this.scopeTypeType_ = parameters.scopeTypeType;
    this.contentRemovalRange_ = parameters.contentRemovalRange;
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.delimiterString =
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
    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();
    const contentRemovalRange_ = this.contentRemovalRange_ ?? this.contentRange;
    return delimiterTarget != null
      ? contentRemovalRange_.union(delimiterTarget.contentRange)
      : contentRemovalRange_;
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
          contentRemovalRange,
          contentRange: createContinuousRange(
            this,
            endTarget,
            includeStart,
            includeEnd
          ),
        });
      }
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
      scopeTypeType: this.scopeTypeType_,
      contentRemovalRange: this.contentRemovalRange_,
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
