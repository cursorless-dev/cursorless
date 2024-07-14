import { Selection } from "@cursorless/common";
import { URI } from "vscode-uri";
import type { DocumentState } from "../types/types";
import { TalonJsEditor } from "./TalonJsEditor";
import { TalonJsTextDocument } from "./TalonJsTextDocument";

let nextDocumentId = 0;

export function createTextEditor(documentState: DocumentState): TalonJsEditor {
  const { text, selection } = documentState;

  const id = String(nextDocumentId++);
  const uri = URI.parse(`talon-js://${id}`);
  const languageId = "plaintext";
  const textDocument = new TalonJsTextDocument(uri, languageId, text);
  const anchor = textDocument.positionAt(selection.anchor);
  const active = textDocument.positionAt(selection.active);
  const visibleRanges = [textDocument.range];
  const selections = [new Selection(anchor, active)];

  return new TalonJsEditor(id, textDocument, visibleRanges, selections);
}
