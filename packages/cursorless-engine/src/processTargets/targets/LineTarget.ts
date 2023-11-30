import { Position, Range, TextEditor } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from ".";
import { expandToFullLine } from "../../util/rangeUtils";
import { tryConstructPlainTarget } from "../../util/tryConstructTarget";
import { createContinuousLineRange } from "../targetUtil/createContinuousRange";

export class LineTarget extends BaseTarget<CommonTargetParameters> {
  type = "LineTarget";
  insertionDelimiter = "\n";
  isLine = true;

  private get fullLineContentRange() {
    return expandToFullLine(this.editor, this.contentRange);
  }

  getLeadingDelimiterTarget() {
    return tryConstructPlainTarget(
      this.editor,
      getLeadingDelimiterRange(this.editor, this.fullLineContentRange),
      this.isReversed,
    );
  }

  getTrailingDelimiterTarget() {
    return tryConstructPlainTarget(
      this.editor,
      getTrailingDelimiterRange(this.editor, this.fullLineContentRange),
      this.isReversed,
    );
  }

  getRemovalRange() {
    const contentRemovalRange = this.fullLineContentRange;
    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();

    return delimiterTarget == null
      ? contentRemovalRange
      : contentRemovalRange.union(delimiterTarget.contentRange);
  }

  getRemovalHighlightRange = () => this.fullLineContentRange;

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: LineTarget,
  ): LineTarget {
    return new LineTarget({
      editor: this.editor,
      isReversed,
      contentRange: createContinuousLineRange(this, endTarget, true, true),
    });
  }

  protected getCloneParameters() {
    return this.state;
  }
}

function getLeadingDelimiterRange(editor: TextEditor, range: Range) {
  const { start } = range;
  return start.line > 0
    ? new Range(editor.document.lineAt(start.line - 1).range.end, range.start)
    : undefined;
}

function getTrailingDelimiterRange(editor: TextEditor, range: Range) {
  const { end } = range;
  return end.line + 1 < editor.document.lineCount
    ? new Range(range.end, new Position(end.line + 1, 0))
    : undefined;
}
