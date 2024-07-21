import type { Selection, TextDocument } from "@cursorless/common";
import { actions } from "talon";

export function setSelections(
  document: TextDocument,
  selections: Selection[],
): Promise<void> {
  const selectionOffsets = selections.map((selection) => ({
    anchor: document.offsetAt(selection.anchor),
    active: document.offsetAt(selection.active),
  }));

  actions.user.cursorless_everywhere_set_selections(selectionOffsets);

  return Promise.resolve();
}
