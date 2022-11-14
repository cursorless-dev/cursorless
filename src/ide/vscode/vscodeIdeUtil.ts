import { TextDocument, TextEditor, TextLine } from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

const editorMap = new WeakMap<vscode.TextEditor, TextEditor>();

export function fromVscodeEditor(editor: vscode.TextEditor): TextEditor {
  if (!editorMap.has(editor)) {
    editorMap.set(editor, new VscodeTextEditorImpl(editor));
  }
  return editorMap.get(editor)!;
}

export function fromVscodeDocument(
  document: vscode.TextDocument,
): TextDocument {
  return new VscodeTextDocumentImpl(document);
}

export function fromVscodeTextLine(line: vscode.TextLine): TextLine {
  return new VscodeTextLineImpl(line);
}
