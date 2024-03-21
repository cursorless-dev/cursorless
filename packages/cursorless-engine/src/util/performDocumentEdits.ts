import { Edit, EditableTextEditor } from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";

export async function performDocumentEdits(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  edits: Edit[],
) {
  const deregister = rangeUpdater.registerReplaceEditList(
    editor.document,
    edits.filter((edit) => edit.isReplace),
  );

  const wereEditsApplied = await editor.edit(edits);

  deregister();

  return wereEditsApplied;
}
