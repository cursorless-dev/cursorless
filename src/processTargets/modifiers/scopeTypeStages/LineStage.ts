import { Position, Range, TextEditor } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  ScopeType,
  Target,
} from "../../../typings/target.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [this.getSingleTarget(target)];
  }

  getEveryTarget(target: Target): ScopeTypeTarget[] {
    const { contentRange, editor } = target;
    const { isEmpty } = contentRange;
    const startLine = isEmpty ? 0 : contentRange.start.line;
    const endLine = isEmpty
      ? editor.document.lineCount - 1
      : contentRange.end.line;
    const targets: ScopeTypeTarget[] = [];

    for (let i = startLine; i <= endLine; ++i) {
      const line = editor.document.lineAt(i);
      if (!line.isEmptyOrWhitespace) {
        targets.push(this.getTargetFromRange(target, line.range));
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
    const contentRange = fitRangeToLineContent(target.editor, range);
    return new ScopeTypeTarget({
      ...getLineContext(target.editor, contentRange),
      scopeType: this.modifier.scopeType,
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
    });
  }
}

export function getLineContext(editor: TextEditor, range: Range) {
  const { document } = editor;
  const { start, end } = range;

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

  return {
    scopeType: "line" as ScopeType,
    delimiter: "\n",
    removal: {
      range: removalRange,
    },
    leadingDelimiter:
      leadingDelimiterRange != null
        ? { range: leadingDelimiterRange }
        : undefined,
    trailingDelimiter:
      trailingDelimiterRange != null
        ? { range: trailingDelimiterRange }
        : undefined,
  };
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
