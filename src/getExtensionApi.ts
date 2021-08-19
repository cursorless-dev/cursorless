import * as vscode from "vscode";
import { ThatMark } from "./core/ThatMark";
import NavigationMap from "./core/NavigationMap";
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

export async function getExtensionApi<T>(extensionId: string) {
  const extension = vscode.extensions.getExtension(extensionId);

  if (extension == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return (await extension.activate()) as T;
}

export const getCursorlessApi = () =>
  getExtensionApi<CursorlessApi>("pokey.cursorless");

export const getParseTreeApi = () =>
  getExtensionApi<ParseTreeApi>("pokey.parse-tree");
