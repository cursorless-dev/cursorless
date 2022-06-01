import { Position, Range, TextEditor } from "vscode";
import { Target } from "../../typings/target.types";
import { expandToFullLine } from "../../util/rangeUtils";
import { tryConstructPlainTarget } from "../../util/tryConstructTarget";
import { createContinuousLineRange } from "../targetUtil/createContinuousRange";
import BaseTarget from "./BaseTarget";

export default class LineTarget extends BaseTarget {
  insertionDelimiter = "\n";
  isLine = true;

  private get fullLineContentRange() {
    return expandToFullLine(this.editor, this.contentRange);
  }

  getLeadingDelimiterTarget() {
    return tryConstructPlainTarget(
      this.editor,
      getLeadingDelimiterRange(this.editor, this.fullLineContentRange),
      this.isReversed
    );
  }

  getTrailingDelimiterTarget() {
    return tryConstructPlainTarget(
      this.editor,
      getTrailingDelimiterRange(this.editor, this.fullLineContentRange),
      this.isReversed
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

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (endTarget.isLine) {
      return new LineTarget({
        editor: this.editor,
        isReversed,
        contentRange: createContinuousLineRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
    }

    return super.createContinuousRangeTarget(
      isReversed,
      endTarget,
      includeStart,
      includeEnd
    );
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
