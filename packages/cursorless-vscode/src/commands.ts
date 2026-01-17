import { CURSORLESS_ORG_URL, DOCS_URL } from "@cursorless/common";
import * as vscode from "vscode";

export const showDocumentation = () => {
  return vscode.env.openExternal(vscode.Uri.parse(DOCS_URL));
};

export const showScopeVisualizerItemDocumentation = (item?: {
  url: string;
}) => {
  const url = item?.url ?? CURSORLESS_ORG_URL;
  return vscode.env.openExternal(vscode.Uri.parse(url));
};

export const showQuickPick = () => {
  return vscode.commands.executeCommand(
    "workbench.action.quickOpen",
    ">Cursorless",
  );
};
