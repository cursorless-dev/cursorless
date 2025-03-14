import type {
  GeneralizedRange,
  TextDocument,
  TextEditor,
  TextLine,
} from "@cursorless/common";
import { Position, Range, toLineRange } from "@cursorless/common";
import type { TextualType } from "../../typings/target.types";
import { expandToFullLine } from "../../util/rangeUtils";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import { constructLineTarget, LineTarget } from "./LineTarget";
import { createContinuousLineRange } from "./util/createContinuousRange";

export class ParagraphTarget extends BaseTarget<CommonTargetParameters> {
  type = "ParagraphTarget";
  textualType: TextualType = "line";
  insertionDelimiter = "\n\n";

  getLeadingDelimiterTarget() {
    return constructLineTarget(
      this.editor,
      getLeadingDelimiterRange(this.editor, this.fullLineContentRange),
      this.isReversed,
    );
  }

  getTrailingDelimiterTarget() {
    return constructLineTarget(
      this.editor,
      getTrailingDelimiterRange(this.editor, this.fullLineContentRange),
      this.isReversed,
    );
  }

  getRemovalRange(): Range {
    // FIXME: In the future we could get rid of this function if {@link
    // getDelimitedSequenceRemovalRange} made a continuous range from the target
    // past its delimiter target and then used the removal range of that.
    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();

    const removalContentRange =
      delimiterTarget != null
        ? this.contentRange.union(delimiterTarget.contentRange)
        : this.contentRange;

    // If there is a delimiter, it will be a line target, so we join it with
    // ourself to create a line target containing ourself and the delimiter
    // line. We then allow the line target removal range code to cleanup any
    // extra leading or trailing newline
    //
    // If there is no delimiter, we just use the line content range,
    // converting it to a line target so that it cleans up leading or trailing
    // newline as necessary
    return new LineTarget({
      contentRange: removalContentRange,
      editor: this.editor,
      isReversed: this.isReversed,
    }).getRemovalRange();
  }

  private get fullLineContentRange() {
    return expandToFullLine(this.editor, this.contentRange);
  }

  getRemovalHighlightRange(): GeneralizedRange {
    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();

    const range =
      delimiterTarget != null
        ? this.fullLineContentRange.union(delimiterTarget.contentRange)
        : this.fullLineContentRange;

    return toLineRange(range);
  }

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: ParagraphTarget,
  ): ParagraphTarget {
    return new ParagraphTarget({
      ...this.getCloneParameters(),
      isReversed,
      contentRange: createContinuousLineRange(this, endTarget, true, true),
    });
  }

  protected getCloneParameters() {
    return this.state;
  }
}

function getLeadingDelimiterRange(editor: TextEditor, contentRange: Range) {
  const { document } = editor;
  const startLine = document.lineAt(contentRange.start);
  const leadingLine = getPreviousNonEmptyLine(document, startLine);
  // Lines are next to each other so they can be no delimiter range
  if (leadingLine != null) {
    if (leadingLine.lineNumber + 1 === startLine.lineNumber) {
      return undefined;
    }
    return new Range(
      new Position(leadingLine.lineNumber + 1, 0),
      document.lineAt(startLine.lineNumber - 1).range.end,
    );
  }
  // Leading delimiter to start of file
  if (startLine.lineNumber > 0) {
    return new Range(
      new Position(0, 0),
      document.lineAt(startLine.lineNumber - 1).range.end,
    );
  }
  return undefined;
}

function getTrailingDelimiterRange(editor: TextEditor, contentRange: Range) {
  const { document } = editor;
  const endLine = document.lineAt(contentRange.end);
  const trailingLine = getNextNonEmptyLine(document, endLine);
  if (trailingLine != null) {
    if (trailingLine.lineNumber - 1 === endLine.lineNumber) {
      return undefined;
    }
    return new Range(
      new Position(endLine.lineNumber + 1, 0),
      document.lineAt(trailingLine.lineNumber - 1).range.end,
    );
  }
  // Trailing delimiter to end of file
  if (endLine.lineNumber < document.lineCount - 1) {
    return new Range(
      new Position(endLine.lineNumber + 1, 0),
      document.lineAt(document.lineCount - 1).range.end,
    );
  }
  return undefined;
}

function getPreviousNonEmptyLine(document: TextDocument, line: TextLine) {
  while (line.lineNumber > 0) {
    const previousLine = document.lineAt(line.lineNumber - 1);
    if (!previousLine.isEmptyOrWhitespace) {
      return previousLine;
    }
    line = previousLine;
  }
  return null;
}

function getNextNonEmptyLine(document: TextDocument, line: TextLine) {
  while (line.lineNumber + 1 < document.lineCount) {
    const nextLine = document.lineAt(line.lineNumber + 1);
    if (!nextLine.isEmptyOrWhitespace) {
      return nextLine;
    }
    line = nextLine;
  }
  return null;
}
