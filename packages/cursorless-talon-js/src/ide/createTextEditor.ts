import { Selection, type TextDocument } from "@cursorless/common";
import { URI } from "vscode-uri";
import type { DocumentState, OffsetSelection } from "../types/types";
import { TalonJsEditor } from "./TalonJsEditor";
import type { TalonJsIDE } from "./TalonJsIDE";
import { TalonJsTextDocument } from "./TalonJsTextDocument";

let nextDocumentId = 0;

export function createTextEditor(
  ide: TalonJsIDE,
  documentState: DocumentState,
): TalonJsEditor {
  const { text, selection } = documentState;

  const id = String(nextDocumentId++);
  const uri = URI.parse(`talon-js://${id}`);
  const languageId = "plaintext";
  const document = new TalonJsTextDocument(uri, languageId, text);
  const visibleRanges = [document.range];
  const selections = [createSelection(document, selection)];

  return new TalonJsEditor(ide, id, document, visibleRanges, selections);
}

export function createSelection(
  document: TextDocument,
  selection: OffsetSelection,
) {
  const anchor = document.positionAt(selection.anchor);
  const active = document.positionAt(selection.active);
  return new Selection(anchor, active);
}
