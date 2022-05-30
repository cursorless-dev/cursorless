import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class TokenTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get delimiterString() {
    return " ";
  }

  protected getCloneParameters() {
    return this.state;
  }
}
