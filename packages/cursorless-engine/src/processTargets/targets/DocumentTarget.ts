import { Range } from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { BaseTarget, CommonTargetParameters, PlainTarget } from "./";

export default class DocumentTarget extends BaseTarget<CommonTargetParameters> {
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

  protected getCloneParameters() {
    return this.state;
  }
}
