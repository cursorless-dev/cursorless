import type { Range } from "@cursorless/common";
import { BaseTarget, type CommonTargetParameters } from "./BaseTarget";
import { InteriorTarget } from "./InteriorTarget";

export class DocumentTarget extends BaseTarget<CommonTargetParameters> {
  type = "DocumentTarget";
  insertionDelimiter = "\n";
  isLine = true;

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getInterior() {
    return [
      new InteriorTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        fullInteriorRange: this.contentRange,
      }),
    ];
  }

  getRemovalRange(): Range {
    return this.contentRange;
  }

  getLeadingDelimiterTarget() {
    return undefined;
  }

  getTrailingDelimiterTarget() {
    return undefined;
  }

  protected getCloneParameters() {
    return this.state;
  }
}
