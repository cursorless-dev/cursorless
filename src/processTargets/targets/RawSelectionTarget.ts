import { Position } from "../../typings/target.types";
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

  withPosition(position: Position): RawSelectionTarget {
    return new RawSelectionTarget({ ...this.state, position });
  }
}
