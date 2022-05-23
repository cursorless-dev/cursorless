import { EditNewLineContext } from "../../typings/target.types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class TokenTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      ...getTokenDelimiters(parameters.editor, parameters.contentRange),
      scopeTypeType: "token",
    });
  }

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: " ",
    };
  }

  clone(): TokenTarget {
    return new TokenTarget(this.state);
  }
}
