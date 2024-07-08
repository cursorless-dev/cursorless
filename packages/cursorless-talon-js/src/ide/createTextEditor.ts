import { Selection } from "@cursorless/common";
import { URI } from "vscode-uri";
import type { DocumentState } from "../types/DocumentState";
import { TalonJsEditor } from "./TalonJsEditor";
import { TalonJsTextDocument } from "./TalonJsTextDocument";

let nextDocumentId = 0;

export function createTextEditor(documentState: DocumentState): TalonJsEditor {
  const {
    text,
    selection: [anchorOffset, activeOffset],
  } = documentState;

  const id = String(nextDocumentId++);
  const uri = URI.parse(`talon-js://${id}`);
  const languageId = "plaintext";
  const textDocument = new TalonJsTextDocument(uri, languageId, text);
  const anchor = textDocument.positionAt(anchorOffset);
  const active = textDocument.positionAt(activeOffset);
  const visibleRanges = [textDocument.range];
  const selections = [new Selection(anchor, active)];

  return new TalonJsEditor(id, textDocument, visibleRanges, selections);
}
