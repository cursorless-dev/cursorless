import { Edit } from "./Types";
import { Selection, TextEditor } from "vscode";
import SelectionUpdater from "./CalculateChanges";

export default async function performDocumentEdits(
  editor: TextEditor,
  edits: Edit[],
  originalSelections: Selection[][] = []
) {
  const selectionUpdater = new SelectionUpdater(
    editor,
    originalSelections,
    edits
  );

  const wereEditsApplied = await performDocumentEditsInner(editor, edits);

  if (!wereEditsApplied) {
    throw new Error("Could not apply edits");
  }

  return selectionUpdater.calculateUpdatedSelections();
}

async function performDocumentEditsInner(editor: TextEditor, edits: Edit[]) {
  return editor.edit((editBuilder) => {
    edits.forEach(({ range, text }) => {
      if (text === "") {
        editBuilder.delete(range);
      } else if (range.isEmpty) {
        editBuilder.insert(range.start, text);
      } else {
        editBuilder.replace(range, text);
      }
    });
  });
}
