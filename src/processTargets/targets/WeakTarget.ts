import { RemovalRange } from "../../typings/target.types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

interface WeakTargetParameters extends CommonTargetParameters {
  // These are needed if constructed from a continuous range
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */
export default class WeakTarget extends BaseTarget {
  constructor(parameters: WeakTargetParameters) {
    const { delimiter, leadingDelimiter, trailingDelimiter } =
      getTokenDelimiters(parameters.editor, parameters.contentRange);
    super({
      ...extractCommonParameters(parameters),
      delimiter,
      leadingDelimiter: parameters.leadingDelimiter ?? leadingDelimiter,
      trailingDelimiter: parameters.trailingDelimiter ?? trailingDelimiter,
    });
  }

  get isWeak() {
    return true;
  }

  cloneWith(parameters: CloneWithParameters): WeakTarget {
    return new WeakTarget({ ...this.state, ...parameters });
  }
}
