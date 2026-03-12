import * as vscode from "vscode";
import { getCursorlessApi, getParseTreeApi } from "../getExtensionApi";

interface NewEditorOptions {
  languageId?: string;
  openBeside?: boolean;
}

export async function openNewEditor(
  content: string,
  { languageId = "plaintext", openBeside = false }: NewEditorOptions = {},
): Promise<vscode.TextEditor> {
  await closeUiElements();

  if (!openBeside) {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  }

  const document = await vscode.workspace.openTextDocument({
    language: languageId,
    content,
  });

  await (await getParseTreeApi()).loadLanguage(languageId);

  (await getCursorlessApi()).testHelpers!.clearCache();

  const editor = await vscode.window.showTextDocument(
    document,
    openBeside ? vscode.ViewColumn.Beside : undefined,
  );

  const eol = content.includes("\r\n")
    ? vscode.EndOfLine.CRLF
    : vscode.EndOfLine.LF;
  if (eol !== editor.document.eol) {
    await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
  }

  return editor;
}

export async function reuseEditor(
  editor: vscode.TextEditor,
  content: string,
  language: string = "plaintext",
): Promise<vscode.TextEditor> {
  await closeUiElements();

  // If the editor is not already active, make it active and close all other editors
  if (editor !== vscode.window.activeTextEditor) {
    editor = await vscode.window.showTextDocument(editor.document);
    // Close other groups
    await vscode.commands.executeCommand(
      "workbench.action.closeEditorsInOtherGroups",
    );
    // Close other editors in the same group
    await vscode.commands.executeCommand("workbench.action.closeOtherEditors");
  }

  // If the editor is not already the right language, change its language and reload the parse tree
  if (editor.document.languageId !== language) {
    await vscode.languages.setTextDocumentLanguage(editor.document, language);
    await (await getParseTreeApi()).loadLanguage(language);
  }

  // Replace the entire contents of the editor with the new content
  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(
        editor.document.lineAt(0).range.start,
        editor.document.lineAt(editor.document.lineCount - 1).range.end,
      ),
      content,
    );

    const eol = content.includes("\r\n")
      ? vscode.EndOfLine.CRLF
      : vscode.EndOfLine.LF;
    if (eol !== editor.document.eol) {
      editBuilder.setEndOfLine(eol);
    }
  });

  return editor;
}

/**
 * Open a new notebook editor with the given cells
 * @param cellContents A list of strings each of which will become the contents
 * of a cell in the notebook
 * @param language The language id to use for all the cells in the notebook
 * @returns notebook
 */
export async function openNewNotebookEditor(
  cellContents: string[],
  language: string = "plaintext",
) {
  await vscode.commands.executeCommand("workbench.action.closeAllEditors");

  const document = await vscode.workspace.openNotebookDocument(
    "jupyter-notebook",
    new vscode.NotebookData(
      cellContents.map(
        (contents) =>
          new vscode.NotebookCellData(
            vscode.NotebookCellKind.Code,
            contents,
            language,
          ),
      ),
    ),
  );

  await (await getParseTreeApi()).loadLanguage(language);

  (await getCursorlessApi()).testHelpers!.clearCache();

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await waitForEditorToOpen();

  return document;
}

function waitForEditorToOpen(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let count = 0;
    const interval = setInterval(() => {
      if (vscode.window.activeTextEditor != null) {
        clearInterval(interval);
        resolve();
      } else {
        count++;
        if (count === 20) {
          clearInterval(interval);
          reject("Timed out waiting for editor to open");
        }
      }
    }, 100);
  });
}

async function closeUiElements() {
  // Many times running these tests opens the sidebar, which slows performance. Close it.
  await vscode.commands.executeCommand("workbench.action.closeSidebar");
  // Close the find widget as well, since it can also be open and cause performance issues.
  await vscode.commands.executeCommand("closeFindWidget");
}
