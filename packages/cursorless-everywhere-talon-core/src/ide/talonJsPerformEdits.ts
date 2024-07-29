import { Edit, type InMemoryTextDocument } from "@cursorless/common";
import type { Talon } from "../types/talon.types";
import type { EditorEdit } from "../types/types";
import type { TalonJsIDE } from "./TalonJsIDE";

export function talonJsPerformEdits(
  talon: Talon,
  ide: TalonJsIDE,
  document: InMemoryTextDocument,
  edits: Edit[],
) {
  const changes = document.edit(edits);

  const editorEdit: EditorEdit = {
    text: document.text,
    changes: changes.map((change) => ({
      rangeOffset: change.rangeOffset,
      rangeLength: change.rangeLength,
      text: change.text,
    })),
  };

  talon.actions.user.cursorless_everywhere_edit_text(editorEdit);

  ide.emitDidChangeTextDocument({
    document,
    contentChanges: changes,
  });
}
