import { Range, TextEditor } from "@cursorless/common";

export const leadingDelimiters = ['"', "'", "(", "[", "{", "<"];
export const trailingDelimiters = ['"', "'", ")", "]", "}", ">", ",", ";", ":"];

export function getLeadingCharacter(editor: TextEditor, contentRange: Range): string {
  const { start } = contentRange;
  const line = editor.document.lineAt(start);
  return start.isAfter(line.range.start)
    ? editor.document.getText(new Range(start.translate(undefined, -1), start))
    : "";
}

export function getTrailingCharacter(editor: TextEditor, contentRange: Range): string {
  const { end } = contentRange;
  const line = editor.document.lineAt(end);
  return end.isBefore(line.range.end)
    ? editor.document.getText(new Range(end.translate(undefined, 1), end))
    : "";
}
