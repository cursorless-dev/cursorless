import type { EditableTextEditor, Selection } from "@cursorless/common";

import uniqDeep from "./uniqDeep";

export async function setSelectionsAndFocusEditor(
  editor: EditableTextEditor,
  selections: Selection[],
  revealRange: boolean = true,
) {
  setSelectionsWithoutFocusingEditor(editor, selections);

  if (revealRange) {
    await editor.revealRange(editor.selections[0]);
  }

  // NB: We focus the editor after setting the selection because otherwise you see
  // an intermediate state where the old selection persists
  await editor.focus();
}

export function setSelectionsWithoutFocusingEditor(
  editor: EditableTextEditor,
  selections: Selection[],
) {
  editor.selections = uniqDeep(selections);
}
