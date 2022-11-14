import type { TextEditor } from "@cursorless/common";
import type * as vscode from "vscode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

const editorMap = new WeakMap<vscode.TextEditor, TextEditor>();

export function fromVscodeEditor(editor: vscode.TextEditor): TextEditor {
  if (!editorMap.has(editor)) {
    editorMap.set(editor, new VscodeTextEditorImpl(editor));
  }
  return editorMap.get(editor)!;
}
