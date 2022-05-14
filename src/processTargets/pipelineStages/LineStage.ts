import { Position, Range } from "vscode";
import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
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

    const removalRange = new Range(
      new Position(start.line, 0),
      selection.editor.document.lineAt(end).range.end
    );

    const leadingDelimiterRange =
      start.line > 0
        ? new Range(
            document.lineAt(start.line - 1).range.end,
            removalRange.start
          )
        : undefined;
    const trailingDelimiterRange =
      end.line + 1 < document.lineCount
        ? new Range(removalRange.end, new Position(end.line + 1, 0))
        : undefined;

    return {
      editor: selection.editor,
      isReversed: selection.isReversed,
      delimiter: "\n",
      contentRange: new Range(start, end),
      removalRange,
      leadingDelimiterRange,
      trailingDelimiterRange,
    };
  }
}
