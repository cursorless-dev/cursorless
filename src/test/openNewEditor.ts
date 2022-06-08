import * as vscode from "vscode";
import { getParseTreeApi } from "../util/getExtensionApi";

export async function openNewEditor(
  content: string,
  language = "plaintext"
) {
  await vscode.commands.executeCommand("workbench.action.closeAllEditors");

  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });

  await (await getParseTreeApi()).loadLanguage(language);

  return await vscode.window.showTextDocument(document);
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
  language = "plaintext"
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
            language
          )
      )
    )
  );

  await (await getParseTreeApi()).loadLanguage(language);

  return document;
}
