import { range } from "lodash";
import * as semver from "semver";
import {
  commands,
  NotebookDocument,
  TextDocument,
  TextEditor,
  version,
} from "vscode";
import { getCellIndex, getNotebookFromCellDocument } from "./notebook";
import { getActiveTextEditor } from "../ide/activeEditor";

export function isVscodeLegacyNotebookVersion() {
  return semver.lt(version, "1.68.0");
}

export async function focusNotebookCellLegacy(editor: TextEditor) {
  const activeTextEditor = getActiveTextEditor();

  if (activeTextEditor == null) {
    return;
  }

  const editorNotebook = getNotebookFromCellDocument(editor.document);
  const activeEditorNotebook = getNotebookFromCellDocument(
    activeTextEditor.document,
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
    activeTextEditor.document,
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
