import { Position, Range, TextEditor } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(
    context: ProcessedTargetsContext,
    selection: TypedSelection
  ): TypedSelection {
    const { document } = selection.editor;
    const startLine = document.lineAt(selection.contentRange.start);
    const endLine = document.lineAt(selection.contentRange.end);
    const start = new Position(
      startLine.lineNumber,
      startLine.firstNonWhitespaceCharacterIndex
    );
    const end = endLine.range.end;
    const contentRange = new Range(start, end);

    return {
      ...selection,
      ...getLineContext(selection.editor, contentRange),
    };
  }
}

export function getLineContext(
  editor: TextEditor,
  range: Range
): Partial<TypedSelection> {
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
    delimiter: "\n",
    interiorRange: undefined,
    boundary: undefined,
    isRawSelection: undefined,
    removalRange,
    leadingDelimiterRange,
    trailingDelimiterRange,
  };
}
