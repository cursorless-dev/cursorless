import type { Edit, EditableTextEditor } from "@cursorless/common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";

export async function performDocumentEdits(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  edits: Edit[],
) {
  const deregister = rangeUpdater.registerReplaceEditList(
    editor.document,
    edits.filter((edit) => edit.isReplace),
  );

  try {
    return await editor.edit(edits);
  } finally {
    deregister();
  }
}
