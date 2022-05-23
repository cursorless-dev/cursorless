import { Range } from "vscode";
import { RemovalRange } from "../../typings/target.types";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

interface SurroundingPairTargetParameters extends CommonTargetParameters {
  delimiter?: string;
  interiorRange?: Range;
  boundary?: [Range, Range];
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class SurroundingPairTarget extends BaseTarget {
  constructor(parameters: SurroundingPairTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: parameters.delimiter ?? " ",
    });
  }

  clone(): SurroundingPairTarget {
    return new SurroundingPairTarget(this.state);
  }
}
