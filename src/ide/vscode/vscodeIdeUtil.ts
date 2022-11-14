import { TextDocument, TextLine } from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

export function fromVscodeDocument(
  document: vscode.TextDocument,
): TextDocument {
  return new VscodeTextDocumentImpl(document);
}

export function fromVscodeTextLine(line: vscode.TextLine): TextLine {
  return new VscodeTextLineImpl(line);
}
