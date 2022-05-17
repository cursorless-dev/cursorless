import { Position, Range, TextEditor } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  ScopeTypeTarget,
  Target,
} from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { createRemovalRange } from "../../../util/targetUtils";
import { ModifierStage } from "../../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget {
    const contentRange = fitRangeToLineContent(
      target.editor,
      target.contentRange
    );
    return {
      scopeType: this.modifier.scopeType,
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
      ...getLineContext(target.editor, contentRange),
    };
  }
}

export function getLineContext(editor: TextEditor, range: Range) {
  const { document } = editor;
  const { start, end } = range;

  const fullLineRange = new Range(
    new Position(start.line, 0),
    editor.document.lineAt(end).range.end
  );

  const leadingDelimiterRange =
    start.line > 0
      ? new Range(
          document.lineAt(start.line - 1).range.end,
          fullLineRange.start
        )
      : undefined;
  const trailingDelimiterRange =
    end.line + 1 < document.lineCount
      ? new Range(fullLineRange.end, new Position(end.line + 1, 0))
      : undefined;

  const removalRange = createRemovalRange(
    fullLineRange,
    leadingDelimiterRange,
    trailingDelimiterRange
  );

  return {
    delimiter: "\n",
    removal: {
      range: removalRange,
      highlightRange: fullLineRange,
      leadingDelimiterRange,
      trailingDelimiterRange,
    },
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
