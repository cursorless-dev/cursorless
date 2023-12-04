import { Range } from "@cursorless/common";
import { BaseTarget, MinimumTargetParameters } from "./BaseTarget";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { createContinuousRangeFromRanges } from "./util/createContinuousRange";

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

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: InteriorTarget,
  ): InteriorTarget {
    return new InteriorTarget({
      ...this.getCloneParameters(),
      isReversed,
      fullInteriorRange: createContinuousRangeFromRanges(
        this.fullInteriorRange,
        endTarget.fullInteriorRange,
        true,
        true,
      ),
    });
  }
}
