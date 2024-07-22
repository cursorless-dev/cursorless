import type { Selection, TextDocument } from "@cursorless/common";
import type { Talon } from "../types/talon.types";

export function setSelections(
  talon: Talon,
  document: TextDocument,
  selections: Selection[],
): Promise<void> {
  const selectionOffsets = selections.map((selection) => ({
    anchor: document.offsetAt(selection.anchor),
    active: document.offsetAt(selection.active),
  }));

  talon.actions.user.cursorless_everywhere_set_selections(selectionOffsets);

  return Promise.resolve();
}
