import { TextEditor, Range, Position } from "vscode";

export function getLineLeadingDelimiterRange(editor: TextEditor, range: Range) {
  const { start } = range;
  return start.line > 0
    ? new Range(editor.document.lineAt(start.line - 1).range.end, range.start)
    : undefined;
}

export function getLineTrailingDelimiterRange(
  editor: TextEditor,
  range: Range
) {
  const { end } = range;
  return end.line + 1 < editor.document.lineCount
    ? new Range(range.end, new Position(end.line + 1, 0))
    : undefined;
}
