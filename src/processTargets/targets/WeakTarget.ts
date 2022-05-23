import _ = require("lodash");
import { Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import SurroundingPairStage from "../modifiers/SurroundingPairStage";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";
import SurroundingPairTarget from "./SurroundingPairTarget";

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

  getInterior(context: ProcessedTargetsContext): Target[] {
    return this.processSurroundingPair(context).flatMap(
      (surroundingPairTarget) => surroundingPairTarget.getInterior(context)!
    );
  }

  getBoundary(context: ProcessedTargetsContext): Target[] {
    return this.processSurroundingPair(context).flatMap(
      (surroundingPairTarget) => surroundingPairTarget.getBoundary(context)!
    );
  }

  clone(): WeakTarget {
    return new WeakTarget(this.state);
  }

  private processSurroundingPair(
    context: ProcessedTargetsContext
  ): SurroundingPairTarget[] {
    const surroundingPairStage = new SurroundingPairStage({
      type: "surroundingPair",
      delimiter: "any",
    });
    return surroundingPairStage.run(context, this);
  }
}
