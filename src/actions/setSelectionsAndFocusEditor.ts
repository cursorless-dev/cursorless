import { commands, Selection, TextEditor, ViewColumn } from "vscode";

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
  selections: Selection[]
) {
  if (editor.viewColumn != null) {
    await commands.executeCommand(columnFocusCommands[editor.viewColumn]);
  }

  editor.selections = selections;
  editor.revealRange(editor.selections[0]);
}
