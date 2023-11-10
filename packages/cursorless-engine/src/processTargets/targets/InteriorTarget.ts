import { Range } from "@cursorless/common";
import { BaseTarget, MinimumTargetParameters } from ".";
import { Target } from "../../typings/target.types";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { isSameType } from "../../util/typeUtils";
import {
  createContinuousRangeFromRanges,
} from "../targetUtil/createContinuousRange";
import {createContinuousRangeUntypedTarget} from "./UntypedTarget";

export interface InteriorTargetParameters extends MinimumTargetParameters {
  readonly fullInteriorRange: Range;
}

export class InteriorTarget extends BaseTarget<InteriorTargetParameters> {
  type = "InteriorTarget";
  insertionDelimiter = " ";
  private readonly fullInteriorRange: Range;

  constructor(parameters: InteriorTargetParameters) {
    super({
      ...parameters,
      contentRange: shrinkRangeToFitContent(
        parameters.editor,
        parameters.fullInteriorRange,
      ),
    });
    this.fullInteriorRange = parameters.fullInteriorRange;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.fullInteriorRange;

  protected getCloneParameters() {
    return {
      ...this.state,
      fullInteriorRange: this.fullInteriorRange,
    };
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    if (isSameType(this, endTarget)) {
      const constructor = Object.getPrototypeOf(this).constructor;

      return new constructor({
        ...this.getCloneParameters(),
        isReversed,
        fullInteriorRange: createContinuousRangeFromRanges(
          this.fullInteriorRange,
          endTarget.fullInteriorRange,
          includeStart,
          includeEnd,
        ),
      });
    }

    return createContinuousRangeUntypedTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd,
    );
  }
}
