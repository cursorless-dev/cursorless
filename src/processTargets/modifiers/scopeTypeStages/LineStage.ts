import { Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import LineTarget from "../../targets/LineTarget";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): LineTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [toLineTarget(target)];
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
        targets.push(
          createLineTarget(target.editor, line.range, target.isReversed)
        );
      }
    }

    if (targets.length === 0) {
      throw new Error(
        `Couldn't find containing ${this.modifier.scopeType.type}`
      );
    }

    return targets;
  }
}

export function toLineTarget(target: Target): LineTarget {
  return new LineTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: fitRangeToLineContent(target.editor, target.contentRange),
    previousTarget: target,
  });
}

export function createLineTarget(
  editor: TextEditor,
  range: Range,
  isReversed: boolean
) {
  return new LineTarget({
    editor,
    isReversed,
    contentRange: fitRangeToLineContent(editor, range),
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
