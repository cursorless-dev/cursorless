import type { DocumentState } from "../types/talon";
import type { TalonJsEditor } from "./TalonJsEditor";

let nextDocumentId = 0;

export function createTextEditor(documentState: DocumentState): TalonJsEditor {
  const {
    text,
    selection: [anchorOffset, activeOffset],
  } = documentState;

  const id = String(nextDocumentId++);
  const textDocument = createTextDocument(text);
  const visibleRanges = [{ start: 0, end: text.length }];
  const selection = [{ start: anchorOffset, end: activeOffset }];

  return new TalonJsEditor(id, textDocument, visibleRanges, selections);
}

function createTextDocument(text: string): TalonJsTextDocument {}
