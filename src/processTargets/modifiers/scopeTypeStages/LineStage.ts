import { Position, Range, TextEditor } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import LineTarget from "../../targets/LineTarget";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): LineTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [this.getSingleTarget(target)];
  }

  getEveryTarget(target: Target): LineTarget[] {
    const { contentRange, editor } = target;
    const { isEmpty } = contentRange;
    const startLine = isEmpty ? 0 : contentRange.start.line;
    const endLine = isEmpty
      ? editor.document.lineCount - 1
      : contentRange.end.line;
    const targets: LineTarget[] = [];

    for (let i = startLine; i <= endLine; ++i) {
      const line = editor.document.lineAt(i);
      if (!line.isEmptyOrWhitespace) {
        targets.push(this.getTargetFromRange(target, line.range));
      }
    }

    if (targets.length === 0) {
      throw new Error(
        `Couldn't find containing ${this.modifier.scopeType.type}`
      );
    }

    return targets;
  }

  getSingleTarget(target: Target): LineTarget {
    return createLineTarget(
      target.editor,
      target.contentRange,
      target.isReversed
    );
  }

  getTargetFromRange(target: Target, range: Range): LineTarget {
    return createLineTarget(target.editor, range, target.isReversed);
  }
}

export function createLineTarget(
  editor: TextEditor,
  range: Range,
  isReversed: boolean
) {
  const { document } = editor;
  const contentRange = fitRangeToLineContent(editor, range);
  const { start, end } = contentRange;

  const removalRange = new Range(
    new Position(start.line, 0),
    editor.document.lineAt(end).range.end
  );

  const leadingDelimiterRange =
    start.line > 0
      ? new Range(document.lineAt(start.line - 1).range.end, removalRange.start)
      : undefined;
  const trailingDelimiterRange =
    end.line + 1 < document.lineCount
      ? new Range(removalRange.end, new Position(end.line + 1, 0))
      : undefined;

  return new LineTarget({
    editor,
    isReversed,
    contentRange,
    leadingDelimiter:
      leadingDelimiterRange != null
        ? { range: leadingDelimiterRange }
        : undefined,
    trailingDelimiter:
      trailingDelimiterRange != null
        ? { range: trailingDelimiterRange }
        : undefined,
  });
}

export function fitRangeToLineContent(editor: TextEditor, range: Range) {
  const startLine = editor.document.lineAt(range.start);
  const endLine = editor.document.lineAt(range.end);
  const endCharacterIndex =
    endLine.range.end.character -
    (endLine.text.length - endLine.text.trimEnd().length);
  return new Range(
    startLine.lineNumber,
    startLine.firstNonWhitespaceCharacterIndex,
    endLine.lineNumber,
    endCharacterIndex
  );
}
