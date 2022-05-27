import { Position, Range, TextDocument, TextEditor, TextLine } from "vscode";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class ParagraphTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: "\n\n",
    });
  }

  get isLine() {
    return true;
  }

  get isParagraph() {
    return true;
  }

  get contentRemovalRange() {
    return new Range(
      new Position(this.contentRange.start.line, 0),
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
  }

  get leadingDelimiterRange() {
    return getLeadingDelimiter(
      this.editor,
      this.contentRange,
      this.position == null
    )?.range;
  }
  get trailingDelimiterRange() {
    return getTrailingDelimiter(
      this.editor,
      this.contentRange,
      this.position == null
    )?.range;
  }

  get leadingDelimiterHighlightRange() {
    return getLeadingDelimiter(
      this.editor,
      this.contentRange,
      this.position == null
    )?.highlight;
  }
  get trailingDelimiterHighlightRange() {
    return getTrailingDelimiter(
      this.editor,
      this.contentRange,
      this.position == null
    )?.highlight;
  }

  getRemovalRange(): Range {
    switch (this.position) {
      case "before":
        return this.leadingDelimiterRange ?? this.contentRange;
      case "after":
        return this.trailingDelimiterRange ?? this.contentRange;
      case "start":
      case "end":
        return this.contentRange;
    }

    const delimiterRange = (() => {
      const leadingDelimiterRange = this.leadingDelimiterRange;
      const trailingDelimiterRange = this.trailingDelimiterRange;
      if (trailingDelimiterRange != null) {
        const { document } = this.editor;
        // Trailing delimiter to end of file. Need to remove leading new line delimiter
        if (
          trailingDelimiterRange.end.line === document.lineCount - 1 &&
          leadingDelimiterRange != null
        ) {
          return new Range(
            document.lineAt(this.contentRange.start.line - 1).range.end,
            trailingDelimiterRange.end
          );
        }
        return trailingDelimiterRange;
      }
      if (leadingDelimiterRange) {
        return leadingDelimiterRange;
      }
      return undefined;
    })();

    return delimiterRange != null
      ? this.contentRemovalRange.union(delimiterRange)
      : this.contentRemovalRange;
  }

  getRemovalHighlightRange(): Range | undefined {
    const delimiterRange =
      this.trailingDelimiterHighlightRange ??
      this.leadingDelimiterHighlightRange;
    return delimiterRange != null
      ? this.contentRemovalRange.union(delimiterRange)
      : this.contentRemovalRange;
  }

  cloneWith(parameters: CloneWithParameters): ParagraphTarget {
    return new ParagraphTarget({ ...this.state, ...parameters });
  }
}

function getLeadingDelimiter(
  editor: TextEditor,
  removalRange: Range,
  keepLastNewline: boolean
) {
  const { document } = editor;
  const { lineAt } = document;
  const startLine = lineAt(removalRange.start);
  const leadingLine = getPreviousNonEmptyLine(document, startLine);
  if (leadingLine != null) {
    const startPosition = keepLastNewline
      ? leadingLine.range.end
      : leadingLine.range.end.translate({ lineDelta: 1 });
    return {
      range: new Range(startPosition, startLine.range.start),
      highlight: new Range(
        lineAt(leadingLine.lineNumber + 1).range.start,
        lineAt(startLine.lineNumber - 1).range.end
      ),
    };
  }
  if (startLine.lineNumber > 0) {
    const { start } = lineAt(0).range;
    return {
      range: new Range(start, startLine.range.start),
      highlight: new Range(start, lineAt(startLine.lineNumber - 1).range.end),
    };
  }
  return undefined;
}

function getTrailingDelimiter(
  editor: TextEditor,
  removalRange: Range,
  keepLastNewline: boolean
) {
  const { document } = editor;
  const { lineAt } = document;
  const endLine = lineAt(removalRange.end);
  const trailingLine = getNextNonEmptyLine(document, endLine);
  if (trailingLine != null) {
    const endPosition = keepLastNewline
      ? trailingLine.range.start
      : trailingLine.range.start.translate({ lineDelta: -1 });
    return {
      range: new Range(endLine.range.end, endPosition),
      highlight: new Range(
        lineAt(endLine.lineNumber + 1).range.start,
        lineAt(trailingLine.lineNumber - 1).range.end
      ),
    };
  }
  if (endLine.lineNumber < document.lineCount - 1) {
    const lastLine = lineAt(document.lineCount - 1);
    // If true there is an empty line after this one that isn't the last/final one
    const highlightStart =
      endLine.lineNumber !== document.lineCount - 1
        ? lineAt(endLine.lineNumber + 1).range.end
        : lastLine.range.start;
    return {
      range: new Range(endLine.range.end, lastLine.range.end),
      highlight: new Range(highlightStart, lastLine.range.end),
    };
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
