import { Range } from "vscode";
import { TargetParameters } from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

export default class LineTarget extends BaseTarget {
  constructor(parameters: TargetParameters) {
    super(parameters);
    this.scopeType = "line";
    this.delimiter = "\n";
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position != null) {
      return undefined;
    }
    return this.contentRange;
  }
}
