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

  private getEveryTarget(target: Target): LineTarget[] {
    const { contentRange, editor } = target;
    const startLine = target.hasExplicitRange ? contentRange.start.line : 0;
    const endLine = target.hasExplicitRange
      ? contentRange.end.line
      : editor.document.lineCount - 1;
    const targets: LineTarget[] = [];

    for (let i = startLine; i <= endLine; ++i) {
      const line = editor.document.lineAt(i);
      if (!line.isEmptyOrWhitespace) {
        targets.push(
          createLineTarget(target.editor, target.isReversed, line.range)
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

function toLineTarget(target: Target): LineTarget {
  return createLineTarget(
    target.editor,
    target.isReversed,
    target.contentRange
  );
}

export function createLineTarget(
  editor: TextEditor,
  isReversed: boolean,
  range: Range
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
