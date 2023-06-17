import { Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { isSameType } from "../../util/typeUtils";
import {
  createContinuousRangeFromRanges,
  createContinuousRangeUntypedTarget,
} from "../targetUtil/createContinuousRange";
import type { MinimumTargetParameters } from "./BaseTarget";
import BaseTarget from "./BaseTarget";

export interface InteriorTargetParameters extends MinimumTargetParameters {
  readonly fullInteriorRange: Range;
}

export default class InteriorTarget extends BaseTarget<InteriorTargetParameters> {
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
