import { EditableTextEditor } from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { Edit } from "../typings/Types";

export async function performDocumentEdits(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  edits: Edit[],
) {
  const deregister = rangeUpdater.registerReplaceEditList(
    editor.document,
    edits.filter((edit) => edit.isReplace),
  );

  const wereEditsApplied = await editor.edit((editBuilder) => {
    edits.forEach(({ range, text, isReplace }) => {
      if (text === "") {
        editBuilder.delete(range);
      } else if (range.isEmpty && !isReplace) {
        editBuilder.insert(range.start, text);
      } else {
        editBuilder.replace(range, text);
      }
    });
  });

  deregister();

  return wereEditsApplied;
}
