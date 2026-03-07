import type { Range } from "@cursorless/common";
import type { TextualType } from "../../typings/target.types";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import { BaseTarget, type CommonTargetParameters } from "./BaseTarget";
import { PlainTarget } from "./PlainTarget";

export class DocumentTarget extends BaseTarget<CommonTargetParameters> {
  type = "DocumentTarget";
  textualType: TextualType = "line";
  insertionDelimiter = "\n\n";

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getInterior() {
    return [
      // Use plain target instead of interior target since we want the same content and removal range for a document interior.
      new PlainTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: shrinkRangeToFitContent(this.editor, this.contentRange),
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
