import type { Range } from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import type { MinimumTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";

export interface InteriorTargetParameters extends MinimumTargetParameters {
  readonly fullInteriorRange: Range;
}

export class InteriorTarget extends BaseTarget<InteriorTargetParameters> {
  type = "InteriorTarget";
  insertionDelimiter = " ";
  readonly fullInteriorRange: Range;

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
      fullInteriorRange: this.fullInteriorRange.union(
        endTarget.fullInteriorRange,
      ),
    });
  }
}
