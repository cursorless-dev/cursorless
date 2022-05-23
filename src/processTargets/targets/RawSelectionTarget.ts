import { EditNewLineContext } from "../../typings/target.types";
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

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: "",
    };
  }

  clone(): RawSelectionTarget {
    return new RawSelectionTarget(this.state);
  }
}
