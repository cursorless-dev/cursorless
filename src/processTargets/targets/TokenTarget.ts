import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class TokenTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: " ",
    });
  }

  cloneWith(parameters: CloneWithParameters): TokenTarget {
    return new TokenTarget({ ...this.state, ...parameters });
  }
}
