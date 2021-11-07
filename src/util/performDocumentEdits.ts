import { Edit } from "../typings/Types";
import { TextEditor } from "vscode";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";

export async function performDocumentEdits(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[]
) {
  const deregister = rangeUpdater.registerReplaceEditList(
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
