import { Edit } from "../typings/Types";
import { TextEditor } from "vscode";
import { SelectionUpdater } from "../core/updateSelections/SelectionUpdater";

export async function performDocumentEdits(
  selectionUpdater: SelectionUpdater,
  editor: TextEditor,
  edits: Edit[]
) {
  const deregister = selectionUpdater.registerReplaceEdits(
    editor.document,
    edits.filter((edit) => edit.isReplace)
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
