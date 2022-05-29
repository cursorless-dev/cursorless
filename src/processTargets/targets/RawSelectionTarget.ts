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
  getLeadingDelimiterRange() {
    return undefined;
  }
  getTrailingDelimiterRange() {
    return undefined;
  }

  protected getCloneParameters() {
    return this.state;
  }
}
