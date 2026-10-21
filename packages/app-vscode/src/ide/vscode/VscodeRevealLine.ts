import vscode from "vscode";
import { RevealLineAt } from "@cursorless/lib-common";
import {
  getCellIndex,
  getNotebookFromCellEditor,
  isDocumentNotebookCell,
} from "@cursorless/lib-vscode-common";
import type { VscodeTextEditor } from "./VscodeTextEditor";

export async function vscodeRevealLine(
  editor: VscodeTextEditor,
  lineNumber: number,
  at: RevealLineAt,
): Promise<void> {
  if (isDocumentNotebookCell(editor.vscodeEditor.document)) {
    revealNotebookCell(editor, at);
    return;
  }

  // For reveal line to the work we have to have the correct editor focused
  if (!editor.isActive) {
    await editor.focus();
  }

  await vscode.commands.executeCommand("revealLine", {
    lineNumber,
    at,
  });
}

function revealNotebookCell(editor: VscodeTextEditor, at: RevealLineAt) {
  const notebookEditor = getNotebookFromCellEditor(editor.vscodeEditor);

  const cellIndex = getCellIndex(
    notebookEditor.notebook,
    editor.vscodeEditor.document,
  );

  notebookEditor.revealRange(
    new vscode.NotebookRange(cellIndex, cellIndex),
    getNotebookRevealType(at),
  );
}

function getNotebookRevealType(
  at: RevealLineAt,
): vscode.NotebookEditorRevealType {
  switch (at) {
    case RevealLineAt.top:
      return vscode.NotebookEditorRevealType.AtTop;
    case RevealLineAt.center:
      return vscode.NotebookEditorRevealType.InCenter;
    case RevealLineAt.bottom:
      throw new Error(
        "VS Code's notebook API doesn't support bottom alignment.",
      );
    default: {
      const _exhaustiveCheck: never = at;
      throw new Error(`Unhandled case: ${_exhaustiveCheck}`);
    }
  }
}
