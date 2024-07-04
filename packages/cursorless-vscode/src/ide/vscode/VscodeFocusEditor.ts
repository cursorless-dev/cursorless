import { getCellIndex } from "@cursorless/vscode-common";
import {
  commands,
  NotebookDocument,
  TextEditor,
  ViewColumn,
  window,
} from "vscode";
import { getNotebookFromCellDocument } from "./notebook/notebook";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

const columnFocusCommands = {
  [ViewColumn.One]: "workbench.action.focusFirstEditorGroup",
  [ViewColumn.Two]: "workbench.action.focusSecondEditorGroup",
  [ViewColumn.Three]: "workbench.action.focusThirdEditorGroup",
  [ViewColumn.Four]: "workbench.action.focusFourthEditorGroup",
  [ViewColumn.Five]: "workbench.action.focusFifthEditorGroup",
  [ViewColumn.Six]: "workbench.action.focusSixthEditorGroup",
  [ViewColumn.Seven]: "workbench.action.focusSeventhEditorGroup",
  [ViewColumn.Eight]: "workbench.action.focusEighthEditorGroup",
  [ViewColumn.Nine]: "workbench.action.focusNinthEditorGroup",
  [ViewColumn.Active]: "",
  [ViewColumn.Beside]: "",
};

/**
 * Focus editor. Returns true if selection needs to be set again.
 */
export default async function vscodeFocusEditor(
  editor: VscodeTextEditorImpl,
): Promise<void> {
  const viewColumn = getViewColumn(editor.vscodeEditor);
  if (viewColumn != null) {
    await commands.executeCommand(columnFocusCommands[viewColumn]);

    if (editor.isDiffEditorOriginal && !editor.isActive) {
      // There is no way of directly focusing the left hand side of a diff
      // editor. Switch side if needed.

      await commands.executeCommand("diffEditor.switchSide");
    } else if (editor.isSearchEditor) {
      // Focusing the search editor brings focus back to the input field. This
      // command moves selection into the actual editor text.

      await commands.executeCommand("search.action.focusNextSearchResult");
    }
  } else {
    // If the view column is null we see if it's a notebook and try to see if we
    // can just move around in the notebook to focus the correct editor

    await focusNotebookCell(editor);
  }
}

function getViewColumn(editor: TextEditor): ViewColumn | undefined {
  if (editor.viewColumn != null) {
    return editor.viewColumn;
  }
  const uri = editor.document.uri.toString();
  const tabGroup = window.tabGroups.all.find((tabGroup) =>
    tabGroup.tabs.find(
      (tab: any) =>
        tab.input?.uri?.toString() === uri ||
        tab.input?.original?.toString() === uri ||
        tab.input?.modified?.toString() === uri,
    ),
  );
  return tabGroup?.viewColumn;
}

async function focusNotebookCell(editor: VscodeTextEditorImpl) {
  const desiredNotebookEditor = getNotebookFromCellDocument(
    editor.vscodeEditor.document,
  );
  if (desiredNotebookEditor == null) {
    throw new Error("Couldn't find notebook editor for given document");
  }

  const desiredNotebookDocument: NotebookDocument =
    desiredNotebookEditor.notebook;

  await commands.executeCommand(
    columnFocusCommands[
      desiredNotebookEditor.viewColumn as keyof typeof columnFocusCommands
    ],
  );

  const desiredEditorIndex = getCellIndex(
    desiredNotebookDocument,
    editor.vscodeEditor.document,
  );

  const desiredSelections = [
    desiredNotebookEditor.selection.with({
      start: desiredEditorIndex,
      end: desiredEditorIndex + 1,
    }),
  ];
  desiredNotebookEditor.selections = desiredSelections;

  // Issue a command to tell VSCode to focus the cell input editor
  // NB: We don't issue the command if it's already focused, because it turns
  // out that this command is actually a toggle, so that causes it to de-focus!
  if (!editor.isActive) {
    await commands.executeCommand("notebook.cell.edit");
  }
}
