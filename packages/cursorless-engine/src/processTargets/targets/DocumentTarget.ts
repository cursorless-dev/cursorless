import type { Range } from "@cursorless/common";
import type { TextualType } from "../../typings/target.types";
import { shrinkRangeToFitContent } from "../../util/selectionUtils";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import { PlainTarget } from "./PlainTarget";

export class DocumentTarget extends BaseTarget<CommonTargetParameters> {
  type = "DocumentTarget";
  textualType: TextualType = "document";
  insertionDelimiter = "\n";

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

  protected getCloneParameters() {
    return this.state;
  }
}
