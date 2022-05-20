import {
  EditNewLineContext,
  ScopeType,
  TargetParameters,
} from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

export interface ScopeTypeTargetParameters extends TargetParameters {
  scopeType: ScopeType;
}

export default class ScopeTypeTarget extends BaseTarget {
  scopeType: ScopeType;
  delimiter: string;

  constructor(parameters: ScopeTypeTargetParameters) {
    super(parameters);
    this.scopeType = parameters.scopeType;
    this.delimiter =
      parameters.delimiter ?? this.getDelimiter(parameters.scopeType);
  }

  private getDelimiter(scopeType: ScopeType): string {
    switch (scopeType) {
      case "namedFunction":
      case "anonymousFunction":
      case "statement":
      case "ifStatement":
        return "\n";
      case "class":
        return "\n\n";
      default:
        return " ";
    }
  }

  getEditNewLineContext(isBefore: boolean): EditNewLineContext {
    // This is the default and should implement the default version whatever that is.
    if (this.delimiter === "\n") {
      return super.getEditNewLineContext(isBefore);
    }
    return {
      delimiter: this.delimiter,
    };
  }
}
