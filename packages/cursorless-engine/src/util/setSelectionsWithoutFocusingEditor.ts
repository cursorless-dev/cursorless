import {
  EditableTextEditor,
  Selection,
  uniqWithHash,
} from "@cursorless/common";

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
