import { Range } from "vscode";
import {
  SimpleScopeTypeType,
  Target,
  TargetType,
} from "../../typings/target.types";
import {
  createContinuousRange,
  createContinuousRangeFromRanges,
} from "../targetUtil/createContinuousRange";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
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
  private delimiter_: string;

  constructor(parameters: ScopeTypeTargetParameters) {
    super(parameters);
    this.scopeTypeType_ = parameters.scopeTypeType;
    this.contentRemovalRange_ = parameters.contentRemovalRange;
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.delimiter_ =
      parameters.delimiter ?? getDelimiter(parameters.scopeTypeType);
    this.hasDelimiterRange_ =
      !!this.leadingDelimiterRange_ || !!this.trailingDelimiterRange_;
  }

  get type(): TargetType {
    return "scopeType";
  }
  get delimiter() {
    return this.delimiter_;
  }
  protected get contentRemovalRange() {
    return this.contentRemovalRange_ ?? this.contentRange;
  }

  getLeadingDelimiterRange() {
    if (this.hasDelimiterRange_) {
      return this.leadingDelimiterRange_;
    }
    return super.getLeadingDelimiterRange();
  }

  getTrailingDelimiterRange() {
    if (this.hasDelimiterRange_) {
      return this.trailingDelimiterRange_;
    }
    return super.getTrailingDelimiterRange();
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (this.isSameType(endTarget)) {
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
