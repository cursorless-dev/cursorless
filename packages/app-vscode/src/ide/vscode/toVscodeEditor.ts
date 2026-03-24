import type { TextEditor } from "@cursorless/lib-common";
import type * as vscode from "vscode";
import type { VscodeTextEditor } from "./VscodeTextEditor";

export function toVscodeEditor(editor: TextEditor): vscode.TextEditor {
  if ("vscodeEditor" in editor) {
    return (editor as VscodeTextEditor).vscodeEditor;
  }
  throw new Error("Can't get vscode editor from non vscode implementation");
}
