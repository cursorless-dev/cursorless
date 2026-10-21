import type { TextEditor } from "vscode";
import { commands, TabInputTextDiff, ViewColumn, window } from "vscode";
import {
  getCellIndex,
  getNotebookFromCellEditor,
  isDocumentNotebookCell,
} from "@cursorless/lib-vscode-common";
import type { VscodeTextEditor } from "./VscodeTextEditor";

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
export async function vscodeFocusEditor(
  editor: VscodeTextEditor,
): Promise<void> {
  if (isDocumentNotebookCell(editor.vscodeEditor.document)) {
    await focusNotebookCell(editor);
    return;
  }

  const viewColumn = getViewColumn(editor.vscodeEditor);

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
}

function getViewColumn(editor: TextEditor): ViewColumn {
  if (editor.viewColumn != null) {
    return editor.viewColumn;
  }

  const uri = editor.document.uri.toString();
  const tabGroup = window.tabGroups.all.find((tabGroup) =>
    tabGroup.tabs.some((tab) => {
      if (tab.input instanceof TabInputTextDiff) {
        return (
          tab.input.original.toString() === uri ||
          tab.input.modified.toString() === uri
        );
      }
      return (tab as any).input?.uri?.toString() === uri;
    }),
  );

  const column = tabGroup?.viewColumn;

  if (column == null) {
    throw new Error("Couldn't determine view column for editor");
  }

  return column;
}

async function focusNotebookCell(editor: VscodeTextEditor) {
  const notebookEditor = getNotebookFromCellEditor(editor.vscodeEditor);

  await commands.executeCommand(
    columnFocusCommands[
      notebookEditor.viewColumn as keyof typeof columnFocusCommands
    ],
  );

  const cellIndex = getCellIndex(
    notebookEditor.notebook,
    editor.vscodeEditor.document,
  );

  notebookEditor.selections = [
    notebookEditor.selection.with({
      start: cellIndex,
      end: cellIndex + 1,
    }),
  ];

  // Issue a command to tell VSCode to focus the cell input editor
  // NB: We don't issue the command if it's already focused, because it turns
  // out that this command is actually a toggle, so that causes it to de-focus!
  if (!editor.isActive) {
    await commands.executeCommand("notebook.cell.edit");
  }
}
