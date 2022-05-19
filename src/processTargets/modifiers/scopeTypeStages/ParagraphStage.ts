import { Range, TextDocument, TextLine } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../../typings/target.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
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
    return this.getTargetFromRange(target);
  }

  getTargetFromRange(target: Target, range?: Range): ScopeTypeTarget {
    const { document } = target.editor;
    const { lineAt } = document;

    if (range == null) {
      range = calculateRange(target);
    }

    const startLine = lineAt(range.start);
    const endLine = lineAt(range.end);
    const contentRange = fitRangeToLineContent(
      target.editor,
      new Range(startLine.range.start, endLine.range.end)
    );
    const removalRange = new Range(startLine.range.start, endLine.range.end);
    const leadingLine = getPreviousNonEmptyLine(document, startLine);
    const trailingLine = getNextNonEmptyLine(document, endLine);

    const leadingDelimiter = (() => {
      if (leadingLine != null) {
        return {
          range: new Range(leadingLine.range.end, startLine.range.start),
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
          highlight: new Range(
            start,
            lineAt(startLine.lineNumber - 1).range.end
          ),
        };
      }
      return undefined;
    })();

    const trailingDelimiter = (() => {
      if (trailingLine != null) {
        return {
          range: new Range(endLine.range.end, trailingLine.range.start),
          highlight: new Range(
            lineAt(endLine.lineNumber + 1).range.start,
            lineAt(trailingLine.lineNumber - 1).range.end
          ),
        };
      }
      if (contentRange.end.line < document.lineCount - 1) {
        const { end } = lineAt(document.lineCount - 1).range;
        return {
          range: new Range(endLine.range.end, end),
          highlight: new Range(lineAt(endLine.lineNumber - 1).range.end, end),
        };
      }
      return undefined;
    })();

    return new ScopeTypeTarget({
      scopeType: this.modifier.scopeType,
      editor: target.editor,
      isReversed: target.isReversed,
      delimiter: "\n\n",
      contentRange,
      removal: { range: removalRange },
      leadingDelimiter,
      trailingDelimiter,
    });
  }
}

function calculateRange(target: Target) {
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
  let endLine = document.lineAt(target.contentRange.end);
  if (!endLine.isEmptyOrWhitespace) {
    while (endLine.lineNumber + 1 < document.lineCount) {
      const line = document.lineAt(endLine.lineNumber + 1);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      endLine = line;
    }
  }
  return new Range(startLine.range.start, endLine.range.end);
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
