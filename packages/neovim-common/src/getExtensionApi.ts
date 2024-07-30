import type { SnippetMap } from "@cursorless/common";
//import * as vscode from "vscode";
import { getNeovimRegistry } from "@cursorless/neovim-registry";
import { NeovimTestHelpers } from "./TestHelpers";

export interface CursorlessApi {
  testHelpers: NeovimTestHelpers | undefined;

  experimental: {
    registerThirdPartySnippets: (
      extensionId: string,
      snippets: SnippetMap,
    ) => void;
  };
}

// See packages\cursorless-neovim\src\extension.ts:createTreeSitter() for neovim
// export interface ParseTreeApi {
//   getNodeAtLocation(location: vscode.Location): SyntaxNode;
//   getTreeForUri(uri: vscode.Uri): Tree;
//   loadLanguage: (languageId: string) => Promise<boolean>;
//   getLanguage(languageId: string): Language | undefined;
// }

export async function getExtensionApi<T>(extensionId: string) {
  const api = getNeovimRegistry().getExtensionApi(extensionId);
  return api == null ? null : (api as T);
}

export async function getExtensionApiStrict<T>(extensionId: string) {
  const api = getNeovimRegistry().getExtensionApi(extensionId);

  if (api == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return api as T;
}

export const EXTENSION_ID = "pokey.cursorless";
export const getCursorlessApi = () =>
  getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);

// export const getParseTreeApi = () =>
//   getExtensionApiStrict<ParseTreeApi>("pokey.parse-tree");

// See packages/cursorless-neovim/src/NeovimCommandServerApi.ts for neovim implementation
/**
 *
 * @returns Command server API or null if not installed
 */
// export const getCommandServerApi = () =>
//   getExtensionApi<CommandServerApi>("pokey.command-server");
