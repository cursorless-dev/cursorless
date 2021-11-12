import * as vscode from "vscode";
import { getParseTreeApi } from "../util/getExtensionApi";

export async function openNewEditor(
  content: string,
  language: string = "plaintext"
) {
  await vscode.commands.executeCommand("workbench.action.closeAllEditors");

  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });

  await (await getParseTreeApi()).loadLanguage(language);

  return await vscode.window.showTextDocument(document);
}
