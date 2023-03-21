import * as semver from "semver";
import {
  commands,
  NotebookDocument,
  TextEditor,
  version,
  ViewColumn,
  window,
} from "vscode";
import { getCellIndex } from "@cursorless/vscode-common";
import { getNotebookFromCellDocument } from "./notebook/notebook";
import {
  focusNotebookCellLegacy,
  isVscodeLegacyNotebookVersion,
} from "./notebook/notebookLegacy";
import type { VscodeIDE } from "./VscodeIDE";
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

export default async function vscodeFocusEditor(
  ide: VscodeIDE,
  editor: VscodeTextEditorImpl,
) {
  const viewColumn = getViewColumn(editor.vscodeEditor);
  if (viewColumn != null) {
    await commands.executeCommand(columnFocusCommands[viewColumn]);
  } else {
    // If the view column is null we see if it's a notebook and try to see if we
    // can just move around in the notebook to focus the correct editor

    if (isVscodeLegacyNotebookVersion()) {
      return await focusNotebookCellLegacy(ide, editor);
    }

    await focusNotebookCell(editor);
  }
}

function getViewColumn(editor: TextEditor): ViewColumn | undefined {
  if (editor.viewColumn != null) {
    return editor.viewColumn;
  }
  // TODO: tabGroups is not available on older versions of vscode we still support.
  // Remove any cast as soon as version is updated.
  if (semver.lt(version, "1.67.0")) {
    return undefined;
  }
  const uri = editor.document.uri.toString();
  const tabGroup = (window as any)?.tabGroups?.all?.find((tabGroup: any) =>
    tabGroup?.tabs.find((tab: any) => tab?.input?.modified?.toString() === uri),
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
