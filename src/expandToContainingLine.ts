import { Range, TextEditor } from "vscode";

export default function expandToContainingLine(
  editor: TextEditor,
  range: Range
) {
  const start = range.start.with({ character: 0 });
  const end = editor.document.lineAt(range.end).range.end;
  return new Range(start, end);
}
