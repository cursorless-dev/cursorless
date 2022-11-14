import { TextDocument, TextEditor, TextLine } from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

export function toVscodeEditor(editor: TextEditor): vscode.TextEditor {
  if ("vscodeEditor" in editor) {
    return (editor as VscodeTextEditorImpl).vscodeEditor;
  }
  throw Error("Can't get vscode editor from non vscode implementation");
}

export function fromVscodeDocument(
  document: vscode.TextDocument,
): TextDocument {
  return new VscodeTextDocumentImpl(document);
}

export function fromVscodeTextLine(line: vscode.TextLine): TextLine {
  return new VscodeTextLineImpl(line);
}
