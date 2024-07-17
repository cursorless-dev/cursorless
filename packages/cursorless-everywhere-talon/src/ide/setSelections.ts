import type { Selection, TextDocument } from "@cursorless/common";
import { actions } from "talon";

export function setSelections(
  document: TextDocument,
  selections: Selection[],
): Promise<void> {
  if (selections.length !== 1) {
    throw Error(
      `TalonJsEditor.setSelections only supports one selection. Found: ${selections.length}`,
    );
  }

  const selection = selections[0];
  const anchor = document.offsetAt(selection.anchor);
  const active = document.offsetAt(selection.active);

  actions.user.cursorless_everywhere_set_selection({ anchor, active });

  return Promise.resolve();
}
