import { Range } from "vscode";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import ParagraphTarget from "../../targets/ParagraphTarget";
import { fitRangeToLineContent } from "./LineStage";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ParagraphTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [this.getSingleTarget(target)];
  }

  getEveryTarget(target: Target): ParagraphTarget[] {
    const { contentRange, editor } = target;
    const { isEmpty } = contentRange;
    const { lineCount } = editor.document;
    const startLine = isEmpty ? 0 : contentRange.start.line;
    const endLine = isEmpty ? lineCount - 1 : contentRange.end.line;
    const targets: ParagraphTarget[] = [];
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
      throw new Error(
        `Couldn't find containing ${this.modifier.scopeType.type}`
      );
    }

    return targets;
  }

  getSingleTarget(target: Target): ParagraphTarget {
    const range = calculateRange(target);
    return new ParagraphTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: fitRangeToLineContent(target.editor, range),
      previousTarget: target,
    });
  }

  getTargetFromRange(target: Target, range: Range): ParagraphTarget {
    return new ParagraphTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: fitRangeToLineContent(target.editor, range),
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
