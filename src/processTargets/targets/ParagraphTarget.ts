import { Position, Range, TextDocument, TextEditor, TextLine } from "vscode";
import { Target, TargetType } from "../../typings/target.types";
import { isSameType } from "../../util/typeUtils";
import { createContinuousLineRange } from "../targetUtil/createContinuousRange";
import { addLineDelimiterRanges } from "../targetUtil/getLineDelimiters";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";
import LineTarget from "./LineTarget";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

export default class ParagraphTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  get type(): TargetType {
    return "paragraph";
  }
  get delimiterString() {
    return "\n\n";
  }
  get isLine() {
    return true;
  }

  protected get contentRemovalRange() {
    return new Range(
      new Position(this.contentRange.start.line, 0),
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
  }

  getLeadingDelimiterTarget() {
    return getLeadingDelimiter(this.editor, this.contentRange);
  }
  getTrailingDelimiterTarget() {
    return getTrailingDelimiter(this.editor, this.contentRange);
  }

  private get leadingDelimiterHighlightRange() {
    return getLeadingDelimiter(this.editor, this.contentRange);
  }
  private get trailingDelimiterHighlightRange() {
    return getTrailingDelimiter(this.editor, this.contentRange);
  }

  getRemovalRange() {
    const delimiterRange = (() => {
      const leadingDelimiterRange = this.getLeadingDelimiterTarget();
      let trailingDelimiterRange = this.getTrailingDelimiterTarget();
      if (trailingDelimiterRange != null) {
        return trailingDelimiterRange;
      }
      if (leadingDelimiterRange) {
        return leadingDelimiterRange;
      }
      return undefined;
    })();

    const removalRange =
      delimiterRange != null
        ? this.contentRemovalRange.union(delimiterRange)
        : this.contentRemovalRange;

    // Check if there is a new line delimiter to remove as well
    return addLineDelimiterRanges(this.editor, removalRange);
  }

  getRemovalHighlightRange() {
    const delimiterRange =
      this.trailingDelimiterHighlightRange ??
      this.leadingDelimiterHighlightRange;
    return delimiterRange != null
      ? this.contentRemovalRange.union(delimiterRange)
      : this.contentRemovalRange;
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (isSameType(this, endTarget)) {
      return new ParagraphTarget({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousLineRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
    }

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

    return createContinuousRangeWeakTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected getCloneParameters() {
    return this.state;
  }
}

function getLeadingDelimiter(editor: TextEditor, contentRange: Range) {
  const { document } = editor;
  const { lineAt } = document;
  const startLine = lineAt(contentRange.start);
  const leadingLine = getPreviousNonEmptyLine(document, startLine);
  // Lines are next to each other so they can be no delimiter range
  if (leadingLine != null) {
    if (leadingLine.lineNumber + 1 === startLine.lineNumber) {
      return undefined;
    }
    return new Range(
      new Position(leadingLine.lineNumber + 1, 0),
      lineAt(startLine.lineNumber - 1).range.end
    );
  }
  // Leading delimiter to start of file
  if (startLine.lineNumber > 0) {
    return new Range(
      new Position(0, 0),
      lineAt(startLine.lineNumber - 1).range.end
    );
  }
  return undefined;
}

function getTrailingDelimiter(editor: TextEditor, contentRange: Range) {
  const { document } = editor;
  const { lineAt } = document;
  const endLine = lineAt(contentRange.end);
  const trailingLine = getNextNonEmptyLine(document, endLine);
  if (trailingLine != null) {
    if (trailingLine.lineNumber - 1 === endLine.lineNumber) {
      return undefined;
    }
    return new Range(
      new Position(endLine.lineNumber + 1, 0),
      lineAt(trailingLine.lineNumber - 1).range.end
    );
  }
  // Trailing delimiter to end of file
  if (endLine.lineNumber < document.lineCount - 1) {
    return new Range(
      new Position(endLine.lineNumber + 1, 0),
      lineAt(document.lineCount - 1).range.end
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
