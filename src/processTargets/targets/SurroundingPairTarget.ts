import { Range } from "vscode";
import { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "../targetUtil/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import TokenTarget from "./TokenTarget";
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
  insertionDelimiter = " ";
  private interiorRange_: Range;
  private boundary_: [Range, Range];

  constructor(parameters: SurroundingPairTargetParameters) {
    super(parameters);
    this.boundary_ = parameters.boundary;
    this.interiorRange_ = parameters.interiorRange;
  }

  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  getRemovalRange(): Range {
    return getTokenRemovalRange(this);
  }

  getInteriorStrict() {
    return [
      new WeakTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: this.interiorRange_,
        previousTarget: this.previousTarget,
      }),
    ];
  }

  getBoundaryStrict() {
    return this.boundary_.map(
      (contentRange) =>
        new TokenTarget({
          editor: this.editor,
          isReversed: this.isReversed,
          contentRange,
        })
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
