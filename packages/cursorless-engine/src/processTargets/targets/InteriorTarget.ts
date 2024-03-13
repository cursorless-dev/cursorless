import { Range } from "@cursorless/common";
import {
  BaseTarget,
  CommonTargetParameters,
  MinimumTargetParameters,
} from "./BaseTarget";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { createContinuousRangeFromRanges } from "./util/createContinuousRange";

export interface InteriorTargetParameters extends MinimumTargetParameters {
  readonly fullInteriorRange: Range;
}

export class InteriorTarget extends BaseTarget<InteriorTargetParameters> {
  type = "InteriorTarget";
  insertionDelimiter = " ";
  private readonly fullInteriorRange: Range;

  // TODO: don't use the constructor, instead we need to create the object with create()
  // Are we happy about that?
  constructor(parameters: InteriorTargetParameters & CommonTargetParameters) {
    super(parameters);
    this.fullInteriorRange = parameters.fullInteriorRange;
  }

  public static async create(
    parameters: InteriorTargetParameters,
  ): Promise<InteriorTarget> {
    return new InteriorTarget({
      ...parameters,
      contentRange: await shrinkRangeToFitContent(
        parameters.editor,
        parameters.fullInteriorRange,
      ),
    });
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = async () => this.fullInteriorRange;

  protected getCloneParameters() {
    return {
      ...this.state,
      fullInteriorRange: this.fullInteriorRange,
    };
  }

  async maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: InteriorTarget,
  ): Promise<InteriorTarget> {
    return await InteriorTarget.create({
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
