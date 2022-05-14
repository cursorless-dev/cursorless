import { Position, Range, TextDocument } from "vscode";
import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection {
    const { document } = selection.editor;

    let startLine = document.lineAt(selection.contentRange.start);
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
    let endLine = document.lineAt(selection.contentRange.end);
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

    const removalRange = new Range(
      new Position(start.line, 0),
      selection.editor.document.lineAt(end).range.end
    );

    const leadingLine = getPreviousNonEmptyLine(document, start.line);
    const trailingLine = getNextNonEmptyLine(document, end.line);

    const leadingDelimiterStart =
      leadingLine != null
        ? leadingLine.range.end
        : start.line > 0
        ? new Position(0, 0)
        : undefined;
    const trailingDelimiterEnd =
      trailingLine != null
        ? trailingLine.range.start
        : end.line < document.lineCount - 1
        ? document.lineAt(document.lineCount - 1).range.end
        : undefined;
    const leadingDelimiterRange =
      leadingDelimiterStart != null
        ? new Range(leadingDelimiterStart, removalRange.start)
        : undefined;
    const trailingDelimiterRange =
      trailingDelimiterEnd != null
        ? new Range(removalRange.end, trailingDelimiterEnd)
        : undefined;

    return {
      editor: selection.editor,
      isReversed: selection.isReversed,
      delimiter: "\n\n",
      contentRange: new Range(start, end),
      removalRange,
      leadingDelimiterRange,
      trailingDelimiterRange,
    };
  }
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
