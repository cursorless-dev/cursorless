import { getCellIndex } from "@cursorless/vscode-common";
import { range } from "lodash";
import { commands, NotebookDocument, TextDocument } from "vscode";
import { toVscodeEditor } from "../toVscodeEditor";
import type { VscodeIDE } from "../VscodeIDE";
import type { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { getNotebookFromCellDocumentCurrent } from "./notebookCurrent";

export async function focusNotebookCellLegacy(
  ide: VscodeIDE,
  editor: VscodeTextEditorImpl,
) {
  const { activeTextEditor } = ide;

  if (activeTextEditor == null) {
    return;
  }

  const vscodeActiveEditor = toVscodeEditor(activeTextEditor);

  const editorNotebook = getNotebookFromCellDocumentCurrent(
    editor.vscodeEditor.document,
  );
  const activeEditorNotebook = getNotebookFromCellDocumentCurrent(
    vscodeActiveEditor.document,
  );

  if (
    editorNotebook == null ||
    activeEditorNotebook == null ||
    editorNotebook !== activeEditorNotebook
  ) {
    return;
  }

  const editorIndex = getCellIndex(
    editorNotebook,
    editor.vscodeEditor.document,
  );
  const activeEditorIndex = getCellIndex(
    editorNotebook,
    vscodeActiveEditor.document,
  );

  if (editorIndex === -1 || activeEditorIndex === -1) {
    throw new Error(
      "Couldn't find editor corresponding to given cell in the expected notebook",
    );
  }

  const cellOffset = editorIndex - activeEditorIndex;

  const command =
    cellOffset < 0
      ? "notebook.focusPreviousEditor"
      : "notebook.focusNextEditor";

  // This is a hack. We just repeatedly issued the command to move upwards or
  // downwards a cell to get to the right cell
  for (const _ of range(Math.abs(cellOffset))) {
    await commands.executeCommand(command);
  }
}

export function getNotebookFromCellDocumentLegacy(document: TextDocument) {
  return (document as any).notebook as NotebookDocument | undefined;
}
