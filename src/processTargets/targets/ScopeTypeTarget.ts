import { Range } from "vscode";
import {
  EditNewLineContext,
  RemovalRange,
  SimpleScopeTypeType,
} from "../../typings/target.types";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export interface ScopeTypeTargetParameters extends CommonTargetParameters {
  scopeTypeType: SimpleScopeTypeType;
  delimiter?: string;
  removalRange?: Range;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class ScopeTypeTarget extends BaseTarget {
  constructor(parameters: ScopeTypeTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: parameters.delimiter ?? getDelimiter(parameters.scopeTypeType),
    });
  }

  getEditNewLineContext(isBefore: boolean): EditNewLineContext {
    // This is the default and should implement the default version whatever that is.
    if (this.delimiter === "\n") {
      return super.getEditNewLineContext(isBefore);
    }
    return {
      delimiter: this.delimiter!,
    };
  }

  clone(): ScopeTypeTarget {
    return new ScopeTypeTarget(<ScopeTypeTargetParameters>this.state);
  }
}

function getDelimiter(scopeType: SimpleScopeTypeType): string {
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
