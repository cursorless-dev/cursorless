import { Position, Range, TextDocument } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  ScopeTypeTarget,
  Target,
} from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { createRemovalRange } from "../../../util/targetUtils";
import { ModifierStage } from "../../PipelineStages.types";
import { fitRangeToLineContent } from "./LineStage";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget {
    const { document } = target.editor;

    let startLine = document.lineAt(target.contentRange.start);
    if (!startLine.isEmptyOrWhitespace) {
      while (startLine.lineNumber > 0) {
        const line = document.lineAt(startLine.lineNumber - 1);
        if (line.isEmptyOrWhitespace) {
          break;
        }
        startLine = line;
      }
    }
    const lineCount = document.lineCount;
    let endLine = document.lineAt(target.contentRange.end);
    if (!endLine.isEmptyOrWhitespace) {
      while (endLine.lineNumber + 1 < lineCount) {
        const line = document.lineAt(endLine.lineNumber + 1);
        if (line.isEmptyOrWhitespace) {
          break;
        }
        endLine = line;
      }
    }

    const start = new Position(
      startLine.lineNumber,
      startLine.firstNonWhitespaceCharacterIndex
    );
    const end = endLine.range.end;

    const contentRange = fitRangeToLineContent(
      target.editor,
      new Range(start, end)
    );

    const fullParagraphRange = new Range(
      new Position(start.line, 0),
      target.editor.document.lineAt(end).range.end
    );

    const leadingLine = getPreviousNonEmptyLine(document, start.line);
    const trailingLine = getNextNonEmptyLine(document, end.line);

    const leadingDelimiterRange = getLeadingDelimiterRange(
      document,
      fullParagraphRange,
      leadingLine?.range.end
    );
    const trailingDelimiterRange = getTrailingDelimiterRange(
      document,
      fullParagraphRange,
      trailingLine?.range.start
    );

    const leadingDelimiterHighlightRange = getLeadingDelimiterRange(
      document,
      fullParagraphRange,
      leadingLine ? new Position(leadingLine.range.end.line + 1, 0) : undefined
    );
    const trailingDelimiterHighlightRange = getTrailingDelimiterRange(
      document,
      fullParagraphRange,
      trailingLine
        ? document.lineAt(trailingLine.range.start.line - 1).range.end
        : undefined
    );

    const removalRange = createRemovalRange(
      fullParagraphRange,
      leadingDelimiterRange,
      trailingDelimiterRange
    );

    const removalHighlightRange = createRemovalRange(
      fullParagraphRange,
      leadingDelimiterHighlightRange,
      trailingDelimiterHighlightRange
    );

    return {
      scopeType: this.modifier.scopeType,
      editor: target.editor,
      isReversed: target.isReversed,
      delimiter: "\n\n",
      contentRange,
      removal: {
        range: removalRange,
        highlightRange: removalHighlightRange,
        leadingDelimiterRange,
        trailingDelimiterRange,
      },
    };
  }
}

function getLeadingDelimiterRange(
  document: TextDocument,
  removalRange: Range,
  position?: Position
) {
  const start =
    position != null
      ? position
      : removalRange.start.line > 0
      ? new Position(0, 0)
      : undefined;
  return start != null ? new Range(start, removalRange.start) : undefined;
}

function getTrailingDelimiterRange(
  document: TextDocument,
  removalRange: Range,
  position?: Position
) {
  const end =
    position != null
      ? position
      : removalRange.end.line < document.lineCount - 1
      ? document.lineAt(document.lineCount - 1).range.end
      : undefined;
  return end != null ? new Range(removalRange.end, end) : undefined;
}

function getPreviousNonEmptyLine(
  document: TextDocument,
  startLineNumber: number
) {
  let line = document.lineAt(startLineNumber);
  while (line.lineNumber > 0) {
    const previousLine = document.lineAt(line.lineNumber - 1);
    if (!previousLine.isEmptyOrWhitespace) {
      return previousLine;
    }
    line = previousLine;
  }
  return null;
}

function getNextNonEmptyLine(document: TextDocument, startLineNumber: number) {
  let line = document.lineAt(startLineNumber);
  while (line.lineNumber + 1 < document.lineCount) {
    const nextLine = document.lineAt(line.lineNumber + 1);
    if (!nextLine.isEmptyOrWhitespace) {
      return nextLine;
    }
    line = nextLine;
  }
  return null;
}
