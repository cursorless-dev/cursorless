import { getParseTreeApi } from "..";
import * as vscode from "vscode";

interface NewEditorOptions {
  languageId?: string;
  openBeside?: boolean;
}

export async function openNewEditor(
  content: string,
  { languageId = "plaintext", openBeside = false }: NewEditorOptions = {},
) {
  if (!openBeside) {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  }

  const document = await vscode.workspace.openTextDocument({
    language: languageId,
    content,
  });

  await (await getParseTreeApi()).loadLanguage(languageId);

  const editor = await vscode.window.showTextDocument(
    document,
    openBeside ? vscode.ViewColumn.Beside : undefined,
  );

  const eol = content.includes("\r\n") ? vscode.EndOfLine.CRLF : vscode.EndOfLine.LF;
  if (eol !== editor.document.eol) {
    await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
  }

  return editor;
}

export async function reuseEditor(
  editor: vscode.TextEditor,
  content: string,
  language: string = "plaintext",
) {
  if (editor.document.languageId !== language) {
    await vscode.languages.setTextDocumentLanguage(editor.document, language);
    await (await getParseTreeApi()).loadLanguage(language);
  }

  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(
        editor.document.lineAt(0).range.start,
        editor.document.lineAt(editor.document.lineCount - 1).range.end,
      ),
      content,
    );

    const eol = content.includes("\r\n") ? vscode.EndOfLine.CRLF : vscode.EndOfLine.LF;
    if (eol !== editor.document.eol) {
      editBuilder.setEndOfLine(eol);
    }
  });
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
          new vscode.NotebookCellData(vscode.NotebookCellKind.Code, contents, language),
      ),
    ),
  );

  await (await getParseTreeApi()).loadLanguage(language);

  return document;
}
