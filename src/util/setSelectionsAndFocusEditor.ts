import { range } from "lodash";
import {
  commands,
  NotebookDocument,
  Selection,
  TextDocument,
  TextEditor,
  ViewColumn,
  window,
} from "vscode";
import { getCellIndex, getNotebookFromCellDocument } from "./notebook";

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
  revealRange: boolean = true
) {
  editor.selections = selections;

  if (revealRange) {
    editor.revealRange(editor.selection);
  }

  // NB: We focus the editor after setting the selection because otherwise you see
  // an intermediate state where the old selection persists
  await focusEditor(editor);
}

export async function focusEditor(editor: TextEditor) {
  if (editor.viewColumn != null) {
    await commands.executeCommand(columnFocusCommands[editor.viewColumn]);
  } else {
    const activeTextEditor = window.activeTextEditor;

    if (activeTextEditor == null) {
      return;
    }

    const editorNotebook = getNotebookFromCellDocument(editor.document);
    const activeEditorNotebook = getNotebookFromCellDocument(
      activeTextEditor.document
    );

    if (
      editorNotebook == null ||
      activeEditorNotebook == null ||
      editorNotebook !== activeEditorNotebook
    ) {
      return;
    }

    const editorIndex = getCellIndex(editorNotebook, editor.document);
    const activeEditorIndex = getCellIndex(
      editorNotebook,
      activeTextEditor.document
    );

    if (editorIndex === -1 || activeEditorIndex === -1) {
      throw new Error(
        "Couldn't find editor corresponding to given cell in the expected notebook"
      );
    }

    const cellOffset = editorIndex - activeEditorIndex;

    const command =
      cellOffset < 0
        ? "notebook.focusPreviousEditor"
        : "notebook.focusNextEditor";

    for (const index of range(Math.abs(cellOffset))) {
      await commands.executeCommand(command);
    }
  }
}
