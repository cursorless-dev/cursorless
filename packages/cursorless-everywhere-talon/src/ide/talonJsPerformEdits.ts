import { Edit, type InMemoryTextDocument } from "@cursorless/common";
import { actions } from "talon";
import type { EditorChanges } from "../types/types";
import type { TalonJsIDE } from "./TalonJsIDE";

export function talonJsPerformEdits(
  ide: TalonJsIDE,
  document: InMemoryTextDocument,
  edits: Edit[],
) {
  const changes = document.edit(edits);

  const editorChanges: EditorChanges = {
    text: document.text,
    changes: changes.map((change) => ({
      rangeOffset: change.rangeOffset,
      rangeLength: change.rangeLength,
      text: change.text,
    })),
  };

  actions.user.cursorless_everywhere_set_text(editorChanges);

  ide.emitDidChangeTextDocument({
    document,
    contentChanges: changes,
  });
}
