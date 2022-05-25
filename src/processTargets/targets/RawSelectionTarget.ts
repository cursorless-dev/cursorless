import BaseTarget, {
  CloneWithParameters,
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

  cloneWith(parameters: CloneWithParameters): RawSelectionTarget {
    return new RawSelectionTarget({ ...this.state, ...parameters });
  }
}
