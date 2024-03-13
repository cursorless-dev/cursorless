import { Range } from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { BaseTarget, CommonTargetParameters } from "./BaseTarget";
import { PlainTarget } from "./PlainTarget";

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
  async getRemovalRange(): Promise<Range> {
    return this.contentRange;
  }

  async getInteriorStrict() {
    return [
      // Use plain target instead of interior target since we want the same content and removal range for a document interior.
      new PlainTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: await shrinkRangeToFitContent(
          this.editor,
          this.contentRange,
        ),
      }),
    ];
  }

  protected getCloneParameters() {
    return this.state;
  }
}
