import {
  EditNewLineContext,
  ScopeType,
  TargetParameters,
} from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

export interface ScopeTypeTargetParameters extends TargetParameters {
  scopeType: ScopeType;
  delimiter: string;
}

export default class ScopeTypeTarget extends BaseTarget {
  scopeType: ScopeType;
  delimiter: string;

  constructor(parameters: ScopeTypeTargetParameters) {
    super(parameters);
    this.scopeType = parameters.scopeType;
    this.delimiter = parameters.delimiter;
  }

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: this.delimiter,
    };
  }
}
