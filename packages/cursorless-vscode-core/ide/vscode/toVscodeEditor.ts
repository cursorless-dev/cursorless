import { TextEditor } from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export function toVscodeEditor(editor: TextEditor): vscode.TextEditor {
  if ("vscodeEditor" in editor) {
    return (editor as VscodeTextEditorImpl).vscodeEditor;
  }
  throw Error("Can't get vscode editor from non vscode implementation");
}
