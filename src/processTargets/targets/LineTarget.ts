import { Range } from "vscode";
import { TargetParameters } from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

export default class LineTarget extends BaseTarget {
  constructor(parameters: TargetParameters) {
    super(parameters);
  }

  protected getRemovalBeforeHighlightRange(): Range | undefined {
    return undefined;
  }

  protected getRemovalAfterHighlightRange(): Range | undefined {
    return undefined;
  }
}
