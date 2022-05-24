import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class RawSelectionTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({ ...extractCommonParameters(parameters), delimiter: "" });
  }

  get delimiter() {
    return undefined;
  }

  clone(): RawSelectionTarget {
    return new RawSelectionTarget(this.state);
  }
}
