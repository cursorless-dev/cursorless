import { EditNewContext } from "../../typings/target.types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */
export default class WeakTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      ...getTokenDelimiters(parameters.editor, parameters.contentRange),
    });
  }

  get isWeak() {
    return true;
  }

  getEditNewContext(_isBefore: boolean): EditNewContext {
    return {
      delimiter: "\n",
    };
  }

  clone(): WeakTarget {
    return new WeakTarget(this.state);
  }
}
