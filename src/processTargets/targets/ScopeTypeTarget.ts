import { Range } from "vscode";
import { RemovalRange, SimpleScopeTypeType } from "../../typings/target.types";
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
