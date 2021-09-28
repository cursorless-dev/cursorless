import * as vscode from "vscode";
import { ThatMark } from "../core/ThatMark";
import NavigationMap from "../core/NavigationMap";
import { SyntaxNode } from "web-tree-sitter";

export interface CursorlessApi {
  thatMark: ThatMark;
  sourceMark: ThatMark;
  navigationMap: NavigationMap;
  addDecorations: () => void;
}

export interface ParseTreeApi {
  getNodeAtLocation(location: vscode.Location): SyntaxNode;
  loadLanguage: (languageId: string) => Promise<boolean>;
}

export interface CommandServerApi {
  globalState: vscode.Memento;
  workspaceState: vscode.Memento;
}

export async function getExtensionApi<T>(extensionId: string) {
  const extension = vscode.extensions.getExtension(extensionId);

  return extension == null ? null : ((await extension.activate()) as T);
}

export async function getExtensionApiStrict<T>(extensionId: string) {
  const extension = vscode.extensions.getExtension(extensionId);

  if (extension == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return (await extension.activate()) as T;
}

export const getCursorlessApi = () =>
  getExtensionApiStrict<CursorlessApi>("pokey.cursorless");

export const getParseTreeApi = () =>
  getExtensionApiStrict<ParseTreeApi>("pokey.parse-tree");

/**
 *
 * @returns Command server API or null if not installed
 */
export const getCommandServerApi = () =>
  getExtensionApi<CommandServerApi>("pokey.command-server");
