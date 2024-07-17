import { Edit, type InMemoryTextDocument } from "@cursorless/common";
import { actions } from "talon";
import type { TalonJsIDE } from "./TalonJsIDE";

export function talonJsPerformEdits(
  ide: TalonJsIDE,
  document: InMemoryTextDocument,
  edits: Edit[],
) {
  const changes = document.edit(edits);

  actions.user.cursorless_everywhere_set_text(document.text);

  ide.emitDidChangeTextDocument({
    document,
    contentChanges: changes,
  });
}
