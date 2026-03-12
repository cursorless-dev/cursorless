import type { TextDocument } from "@cursorless/common";
import { InMemoryTextDocument, Selection } from "@cursorless/common";
import { URI } from "vscode-uri";
import type { Talon } from "../types/talon.types";
import type { EditorState, SelectionOffsets } from "../types/types";
import { TalonJsTextEditor } from "./TalonJsTextEditor";
import type { TalonJsIDE } from "./TalonJsIDE";

let nextId = 0;

export function createTextEditor(
  talon: Talon,
  ide: TalonJsIDE,
  editorState: EditorState,
): TalonJsTextEditor {
  const id = String(nextId++);
  const uri = URI.parse(`talon-js://${id}`);
  const languageId = editorState.languageId ?? "plaintext";
  const document = new InMemoryTextDocument(uri, languageId, editorState.text);
  const visibleRanges = [document.range];
  const selections = editorState.selections.map((selection) =>
    createSelection(document, selection),
  );

  return new TalonJsTextEditor(
    talon,
    ide,
    id,
    document,
    visibleRanges,
    selections,
  );
}

export function createSelection(
  document: TextDocument,
  selection: SelectionOffsets,
) {
  const anchor = document.positionAt(selection.anchor);
  const active = document.positionAt(selection.active);
  return new Selection(anchor, active);
}
