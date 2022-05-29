import { Range } from "vscode";
import { Target, TargetType } from "../../typings/target.types";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
} from "./BaseTarget";
import WeakTarget, { createContinuousRangeWeakTarget } from "./WeakTarget";

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
    super(parameters);
    this.boundary_ = parameters.boundary;
    this.interiorRange_ = parameters.interiorRange;
  }

  get type(): TargetType {
    return "surroundingPair";
  }
  get delimiter() {
    return " ";
  }

  getInteriorStrict() {
    return [
      new WeakTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: this.interiorRange_,
      }),
    ];
  }

  getBoundaryStrict() {
    return this.boundary_.map(
      (contentRange) =>
        new WeakTarget({
          editor: this.editor,
          isReversed: this.isReversed,
          contentRange,
        })
    );
  }

  cloneWith(parameters: CloneWithParameters) {
    return new SurroundingPairTarget({
      ...this.getCloneParameters(),
      ...parameters,
    });
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (this.isSameType(endTarget)) {
      return new SurroundingPairTarget({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
    }

    return createContinuousRangeWeakTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      interiorRange: this.interiorRange_,
      boundary: this.boundary_,
    };
  }
}
