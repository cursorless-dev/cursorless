import { Position, TextEditor } from "vscode";

export function isAtEndOfLine(editor: TextEditor, position: Position) {
  const endLine = editor.document.lineAt(position);

  return position.isEqual(endLine.range.end);
}

export function isAtStartOfLine(editor: TextEditor, position: Position) {
  return position.character === 0;
}
