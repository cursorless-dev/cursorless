import type { Edit, EditableTextEditor } from "@cursorless/lib-common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";

export async function performDocumentEdits(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  edits: Edit[],
) {
  const eol = editor.document.eol === "LF" ? "\n" : "\r\n";

  const deregister = rangeUpdater.registerReplaceEditList(
    editor.document,
    edits
      .filter((edit) => edit.isReplace)
      .map((edit) => ({
        ...edit,
        text: edit.text.replaceAll(/\r?\n/gu, eol),
      })),
  );

  try {
    return await editor.edit(edits);
  } finally {
    deregister();
  }
}
