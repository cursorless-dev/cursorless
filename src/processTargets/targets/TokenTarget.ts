import { TargetType } from "../../typings/target.types";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class TokenTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get type(): TargetType {
    return "token";
  }
  get delimiter() {
    return " ";
  }

  protected getCloneParameters() {
    return this.state;
  }
}
