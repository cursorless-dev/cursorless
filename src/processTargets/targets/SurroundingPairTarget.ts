import { Range } from "vscode";
import { Position, RemovalRange, Target } from "../../typings/target.types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";
import WeakTarget from "./WeakTarget";

interface SurroundingPairTargetParameters extends CommonTargetParameters {
  /**
   * Represents the interior range of this selection. For example, for a
   * surrounding pair this would exclude the opening and closing delimiter. For an if
   * statement this would be the statements in the body.
   */
  readonly interiorRange: Range;

  /**
   * Represents the boundary ranges of this selection. For example, for a
   * surrounding pair this would be the opening and closing delimiter. For an if
   * statement this would be the line of the guard as well as the closing brace.
   */
  readonly boundary: [Range, Range];
}

export default class SurroundingPairTarget extends BaseTarget {
  private interiorRange_: Range;
  private boundary_: [Range, Range];

  constructor(parameters: SurroundingPairTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      ...getTokenDelimiters(parameters.editor, parameters.contentRange),
    });
    this.boundary_ = parameters.boundary;
    this.interiorRange_ = parameters.interiorRange;
  }

  getInteriorStrict(): Target[] {
    if (this.interiorRange_ == null || this.position != null) {
      throw Error("No available interior");
    }
    return [
      new WeakTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: this.interiorRange_,
      }),
    ];
  }

  getBoundaryStrict(): Target[] {
    if (this.boundary_ == null || this.position != null) {
      throw Error("No available boundaries");
    }
    return this.boundary_.map(
      (contentRange) =>
        new WeakTarget({
          editor: this.editor,
          isReversed: this.isReversed,
          contentRange,
        })
    );
  }

  withPosition(position: Position): SurroundingPairTarget {
    return new SurroundingPairTarget({
      ...this.state,
      interiorRange: this.interiorRange_,
      boundary: this.boundary_,
      position,
    });
  }
}
