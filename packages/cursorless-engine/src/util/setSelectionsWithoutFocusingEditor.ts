import {
  EditableTextEditor,
  Selection,
  uniqWithHash,
} from "@cursorless/common";

export async function setSelectionsWithoutFocusingEditorAndRevealRange(
  editor: EditableTextEditor,
  selections: Selection[],
  revealRange: boolean,
): Promise<void> {
  await setSelectionsWithoutFocusingEditor(editor, selections);

  if (revealRange) {
    await editor.revealRange(editor.selections[0]);
  }
}

export async function setSelectionsWithoutFocusingEditor(
  editor: EditableTextEditor,
  selections: Selection[],
) {
  await editor.setSelections(
    uniqWithHash(
      selections,
      (a, b) => a.isEqual(b),
      (s) => s.concise(),
    ),
  );
}
