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

export function addLineDelimiterRanges(editor: TextEditor, range: Range) {
  const trailingDelimiterRange = getLineTrailingDelimiterRange(editor, range);
  if (trailingDelimiterRange != null) {
    return range.union(trailingDelimiterRange);
  }
  const leadingDelimiterRange = getLineLeadingDelimiterRange(editor, range);
  if (leadingDelimiterRange != null) {
    return range.union(leadingDelimiterRange);
  }
  return range;
}
