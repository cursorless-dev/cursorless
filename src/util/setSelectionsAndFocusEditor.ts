import * as semver from "semver";
import {
  commands,
  NotebookDocument,
  Selection,
  TextEditor,
  version,
  ViewColumn,
  window,
} from "vscode";
import { getCellIndex, getNotebookFromCellDocument } from "./notebook";
import {
  focusNotebookCellLegacy,
  isVscodeLegacyNotebookVersion,
} from "./notebookLegacy";
import uniqDeep from "./uniqDeep";

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

export async function setSelectionsAndFocusEditor(
  editor: TextEditor,
  selections: Selection[],
  revealRange: boolean = true,
) {
  setSelectionsWithoutFocusingEditor(editor, selections);

  if (revealRange) {
    editor.revealRange(editor.selection);
  }

  // NB: We focus the editor after setting the selection because otherwise you see
  // an intermediate state where the old selection persists
  await focusEditor(editor);
}

export function setSelectionsWithoutFocusingEditor(
  editor: TextEditor,
  selections: Selection[],
) {
  editor.selections = uniqDeep(selections);
}

export async function focusEditor(editor: TextEditor) {
  const viewColumn = getViewColumn(editor);
  if (viewColumn != null) {
    await commands.executeCommand(columnFocusCommands[viewColumn]);
  } else {
    // If the view column is null we see if it's a notebook and try to see if we
    // can just move around in the notebook to focus the correct editor

    if (isVscodeLegacyNotebookVersion()) {
      return await focusNotebookCellLegacy(editor);
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

async function focusNotebookCell(editor: TextEditor) {
  const desiredNotebookEditor = getNotebookFromCellDocument(editor.document);
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
    editor.document,
  );

  const desiredSelections = [
    desiredNotebookEditor.selection.with({
      start: desiredEditorIndex,
      end: desiredEditorIndex + 1,
    }),
  ];
  desiredNotebookEditor.selections = desiredSelections;
  desiredNotebookEditor.revealRange(desiredSelections[0]);

  // Issue a command to tell VSCode to focus the cell input editor
  // NB: We don't issue the command if it's already focused, because it turns
  // out that this command is actually a toggle, so that causes it to de-focus!
  if (window.activeTextEditor !== editor) {
    await commands.executeCommand("notebook.cell.edit");
  }
}
