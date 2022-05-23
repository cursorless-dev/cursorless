import { Range, TextEditor } from "vscode";
import {
  EditNewLineContext,
  RemovalRange,
  ScopeType,
} from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

export interface ScopeTypeTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  scopeType: ScopeType;
  delimiter?: string;
  contentRange: Range;
  removalRange?: Range;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class ScopeTypeTarget extends BaseTarget {
  constructor(parameters: ScopeTypeTargetParameters) {
    super({
      ...parameters,
      delimiter: parameters.delimiter ?? getDelimiter(parameters.scopeType),
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
}

function getDelimiter(scopeType: ScopeType): string {
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
