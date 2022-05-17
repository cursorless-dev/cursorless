import { Position, Range, TextDocument } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  ScopeTypeTarget,
  Target,
} from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { fitRangeToLineContent } from "./LineStage";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(
    context: ProcessedTargetsContext,
    target: Target
  ): ScopeTypeTarget | ScopeTypeTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return this.getSingleTarget(target);
  }

  getEveryTarget(target: Target): ScopeTypeTarget | ScopeTypeTarget[] {
    const { contentRange, editor } = target;
    const { isEmpty } = contentRange;
    const { lineCount } = editor.document;
    const startLine = isEmpty ? 0 : contentRange.start.line;
    const endLine = isEmpty ? lineCount - 1 : contentRange.end.line;
    const targets: ScopeTypeTarget[] = [];
    let paragraphStart = -1;

    const possiblyAddParagraph = (
      paragraphStart: number,
      paragraphEnd: number
    ) => {
      // Paragraph and selection intersects
      if (paragraphEnd >= startLine && paragraphStart <= endLine) {
        targets.push(
          this.getTargetFromRange(
            target,
            new Range(paragraphStart, 0, paragraphEnd, 0)
          )
        );
      }
    };

    for (let i = 0; i < lineCount; ++i) {
      const line = editor.document.lineAt(i);
      if (line.isEmptyOrWhitespace) {
        // End of paragraph
        if (paragraphStart > -1) {
          possiblyAddParagraph(paragraphStart, i - 1);
          paragraphStart = -1;
        }
      }
      // Start of paragraph
      else if (paragraphStart < 0) {
        paragraphStart = i;
      }
      // Last line is non empty. End of paragraph
      if (i === lineCount - 1 && !line.isEmptyOrWhitespace) {
        possiblyAddParagraph(paragraphStart, i);
      }
    }

    if (targets.length === 0) {
      throw new Error(`Couldn't find containing ${this.modifier.scopeType}`);
    }

    return targets;
  }

  getSingleTarget(target: Target): ScopeTypeTarget {
    return this.getTargetFromRange(target, target.contentRange);
  }

  getTargetFromRange(target: Target, range: Range): ScopeTypeTarget {
    const { document } = target.editor;

    let startLine = document.lineAt(range.start);
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
    let endLine = document.lineAt(range.end);
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

    const removalRange = new Range(
      new Position(start.line, 0),
      document.lineAt(end).range.end
    );

    const leadingLine = getPreviousNonEmptyLine(document, start.line);
    const trailingLine = getNextNonEmptyLine(document, end.line);

    const leadingDelimiterRange = getLeadingDelimiterRange(
      document,
      removalRange,
      leadingLine?.range.end
    );
    const trailingDelimiterRange = getTrailingDelimiterRange(
      document,
      removalRange,
      trailingLine?.range.start
    );

    const leadingDelimiterHighlightRange = getLeadingDelimiterRange(
      document,
      removalRange,
      leadingLine ? new Position(leadingLine.range.end.line + 1, 0) : undefined
    );
    const trailingDelimiterHighlightRange = getTrailingDelimiterRange(
      document,
      removalRange,
      trailingLine
        ? document.lineAt(trailingLine.range.start.line - 1).range.end
        : undefined
    );

    return {
      scopeType: this.modifier.scopeType,
      editor: target.editor,
      isReversed: target.isReversed,
      delimiter: "\n\n",
      contentRange,
      removal: {
        range: removalRange,
        leadingDelimiterRange,
        trailingDelimiterRange,
        leadingDelimiterHighlightRange,
        trailingDelimiterHighlightRange,
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
