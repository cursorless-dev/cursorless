import { Range } from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { BaseTarget, CommonTargetParameters, PlainTarget } from "./";
import type { Target } from "../../typings/target.types";
import { createContinuousRangeOrUntypedTarget } from "../targetUtil/createContinuousRange";

export class DocumentTarget extends BaseTarget<CommonTargetParameters> {
  type = "DocumentTarget";
  insertionDelimiter = "\n";
  isLine = true;

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getLeadingDelimiterTarget() {
    return undefined;
  }
  getTrailingDelimiterTarget() {
    return undefined;
  }
  getRemovalRange(): Range {
    return this.contentRange;
  }

  getInteriorStrict() {
    return [
      // Use plain target instead of interior target since we want the same content and removal range for a document interior.
      new PlainTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: shrinkRangeToFitContent(this.editor, this.contentRange),
      }),
    ];
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    return createContinuousRangeOrUntypedTarget(
      isReversed,
      this,
      this.getCloneParameters(),
      endTarget,
      includeStart,
      includeEnd,
    );
  }

  protected getCloneParameters() {
    return this.state;
  }
}
