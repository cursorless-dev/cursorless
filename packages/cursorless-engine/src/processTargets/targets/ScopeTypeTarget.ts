import { Range, SimpleScopeTypeType } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import { InteriorTarget } from "./InteriorTarget";
import { PlainTarget } from "./PlainTarget";
import { Target } from "../../typings/target.types";
import {
  createContinuousRange,
  createContinuousRangeFromRanges,
} from "./util/createContinuousRange";
import { getDelimitedSequenceRemovalRange } from "./util/insertionRemovalBehaviors/DelimitedSequenceInsertionRemovalBehavior";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "./util/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";

export interface ScopeTypeTargetParameters extends CommonTargetParameters {
  readonly scopeTypeType: SimpleScopeTypeType;
  readonly insertionDelimiter?: string;
  readonly prefixRange?: Range;
  readonly removalRange?: Range;
  readonly interiorRange?: Range;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export class ScopeTypeTarget extends BaseTarget<ScopeTypeTargetParameters> {
  type = "ScopeTypeTarget";
  private scopeTypeType_: SimpleScopeTypeType;
  private removalRange_?: Range;
  private interiorRange_?: Range;
  private leadingDelimiterRange_?: Range;
  private trailingDelimiterRange_?: Range;
  private hasDelimiterRange_: boolean;
  public readonly prefixRange?: Range;
  readonly insertionDelimiter: string;

  constructor(parameters: ScopeTypeTargetParameters) {
    super(parameters);
    this.scopeTypeType_ = parameters.scopeTypeType;
    this.removalRange_ = parameters.removalRange;
    this.interiorRange_ = parameters.interiorRange;
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.prefixRange = parameters.prefixRange;
    this.insertionDelimiter =
      parameters.insertionDelimiter ??
      getInsertionDelimiter(parameters.scopeTypeType);
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

  getInterior() {
    if (this.interiorRange_ == null) {
      return super.getInterior();
    }
    return [
      new InteriorTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        fullInteriorRange: this.interiorRange_,
      }),
    ];
  }

  getRemovalRange(): Range {
    return this.removalRange_ != null
      ? this.removalRange_
      : this.hasDelimiterRange_
        ? getDelimitedSequenceRemovalRange(this)
        : getTokenRemovalRange(this);
  }

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: ScopeTypeTarget,
  ): ScopeTypeTarget | null {
    if (this.scopeTypeType_ !== endTarget.scopeTypeType_) {
      return null;
    }

    const contentRemovalRange =
      this.removalRange_ != null || endTarget.removalRange_ != null
        ? createContinuousRangeFromRanges(
            this.removalRange_ ?? this.contentRange,
            endTarget.removalRange_ ?? endTarget.contentRange,
            true,
            true,
          )
        : undefined;

    return new ScopeTypeTarget({
      ...this.getCloneParameters(),
      isReversed,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: endTarget.trailingDelimiterRange_,
      removalRange: contentRemovalRange,
      contentRange: createContinuousRange(this, endTarget, true, true),
    });
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      insertionDelimiter: this.insertionDelimiter,
      prefixRange: this.prefixRange,
      removalRange: undefined,
      interiorRange: undefined,
      scopeTypeType: this.scopeTypeType_,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: this.trailingDelimiterRange_,
    };
  }
}

function getInsertionDelimiter(scopeType: SimpleScopeTypeType): string {
  switch (scopeType) {
    case "class":
    case "namedFunction":
    case "section":
    case "sectionLevelOne":
    case "sectionLevelTwo":
    case "sectionLevelThree":
    case "sectionLevelFour":
    case "sectionLevelFive":
    case "sectionLevelSix":
    case "part":
    case "chapter":
    case "subSection":
    case "subSubSection":
    case "namedParagraph":
    case "subParagraph":
      return "\n\n";

    case "anonymousFunction":
    case "statement":
    case "ifStatement":
    case "comment":
    case "xmlElement":
    case "collectionItem":
    case "branch":
    case "environment":
      return "\n";

    default:
      return " ";
  }
}
