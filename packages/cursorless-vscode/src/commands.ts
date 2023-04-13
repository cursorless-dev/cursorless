import * as vscode from "vscode";

export const showDocumentation = () =>
  vscode.env.openExternal(vscode.Uri.parse("https://www.cursorless.org/docs/"));

export const showQuickPick = () =>
  vscode.commands.executeCommand("workbench.action.quickOpen", ">Cursorless");
