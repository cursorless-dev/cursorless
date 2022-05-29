import { TargetType } from "../../typings/target.types";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

export default class RawSelectionTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get type(): TargetType {
    return "rawSelection";
  }
  get delimiter() {
    return undefined;
  }
  getLeadingDelimiterTarget() {
    return undefined;
  }
  getTrailingDelimiterTarget() {
    return undefined;
  }

  protected getCloneParameters() {
    return this.state;
  }
}
