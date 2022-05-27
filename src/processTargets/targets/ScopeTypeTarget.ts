import { Range } from "vscode";
import { SimpleScopeTypeType } from "../../typings/target.types";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export interface ScopeTypeTargetParameters extends CommonTargetParameters {
  readonly scopeTypeType: SimpleScopeTypeType;
  readonly delimiter?: string;
  readonly contentRemovalRange?: Range;
  readonly leadingDelimiterRange?: Range;
  readonly trailingDelimiterRange?: Range;
}

export default class ScopeTypeTarget extends BaseTarget {
  private contentRemovalRange_?: Range;
  private leadingDelimiterRange_?: Range;
  private trailingDelimiterRange_?: Range;
  private hasDelimiterRange_: boolean;

  constructor(parameters: ScopeTypeTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: parameters.delimiter ?? getDelimiter(parameters.scopeTypeType),
    });
    this.contentRemovalRange_ = parameters.contentRemovalRange;
    this.leadingDelimiterRange_ = parameters.leadingDelimiterRange;
    this.trailingDelimiterRange_ = parameters.trailingDelimiterRange;
    this.hasDelimiterRange_ =
      !!this.leadingDelimiterRange_ || !!this.trailingDelimiterRange_;
  }

  get contentRemovalRange() {
    return this.contentRemovalRange_ ?? this.contentRange;
  }

  get leadingDelimiterRange() {
    if (this.hasDelimiterRange_) {
      return this.leadingDelimiterRange_;
    }
    return super.leadingDelimiterRange;
  }

  get trailingDelimiterRange() {
    if (this.hasDelimiterRange_) {
      return this.trailingDelimiterRange_;
    }
    return super.trailingDelimiterRange;
  }

  cloneWith(parameters: CloneWithParameters): ScopeTypeTarget {
    return new ScopeTypeTarget({
      ...(<ScopeTypeTargetParameters>this.state),
      contentRemovalRange: this.contentRemovalRange_,
      leadingDelimiterRange: this.leadingDelimiterRange_,
      trailingDelimiterRange: this.trailingDelimiterRange_,
      ...parameters,
    });
  }
}

function getDelimiter(scopeType: SimpleScopeTypeType): string {
  switch (scopeType) {
    case "anonymousFunction":
    case "statement":
    case "ifStatement":
      return "\n";
    case "namedFunction":
    case "class":
      return "\n\n";
    default:
      return " ";
  }
}
