import type { SnippetMap } from "@cursorless/common";
//import * as vscode from "vscode";
import { TestHelpers } from "./TestHelpers";

export interface CursorlessApi {
  testHelpers: TestHelpers | undefined;

  experimental: {
    registerThirdPartySnippets: (
      extensionId: string,
      snippets: SnippetMap,
    ) => void;
  };
}

// export interface ParseTreeApi {
//   getNodeAtLocation(location: vscode.Location): SyntaxNode;
//   getTreeForUri(uri: vscode.Uri): Tree;
//   loadLanguage: (languageId: string) => Promise<boolean>;
//   getLanguage(languageId: string): Language | undefined;
// }

export async function getExtensionApi<T>(extensionId: string) {
  const registry = require("@cursorless/neovim-registry").getNeovimRegistry();
  const api = registry.getExtensionApi(extensionId);
  return api == null ? null : (api as T);
}

export async function getExtensionApiStrict<T>(extensionId: string) {
  const registry = require("@cursorless/neovim-registry").getNeovimRegistry();
  const api = registry.getExtensionApi(extensionId);

  if (api == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return api as T;
}

// see packages\cursorless-neovim\src\singletons\cursorlessapi.singleton.ts
// for old implementation
export const EXTENSION_ID = "pokey.cursorless";
export const getCursorlessApi = () =>
  getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);

// export const getParseTreeApi = () =>
//   getExtensionApiStrict<ParseTreeApi>("pokey.parse-tree");

/**
 *
 * @returns Command server API or null if not installed
 */
// export const getCommandServerApi = () =>
//   getExtensionApi<CommandServerApi>("pokey.command-server");
