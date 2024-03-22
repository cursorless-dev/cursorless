import type { CommandServerApi, SnippetMap } from "@cursorless/common";
//import * as vscode from "vscode";
import type { Language, SyntaxNode, Tree } from "web-tree-sitter";
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

// export async function getExtensionApi<T>(extensionId: string) {
//   const extension = vscode.extensions.getExtension(extensionId);

//   return extension == null ? null : ((await extension.activate()) as T);
// }

// export async function getExtensionApiStrict<T>(extensionId: string) {
//   const extension = vscode.extensions.getExtension(extensionId);

//   if (extension == null) {
//     throw new Error(`Could not get ${extensionId} extension`);
//   }

//   return (await extension.activate()) as T;
// }

// see packages\cursorless-neovim\src\singletons\cursorlessapi.singleton.ts for implementation
// export const EXTENSION_ID = "pokey.cursorless";
// export const getCursorlessApi = () =>
//   getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);

// export const getParseTreeApi = () =>
//   getExtensionApiStrict<ParseTreeApi>("pokey.parse-tree");

/**
 *
 * @returns Command server API or null if not installed
 */
// export const getCommandServerApi = () =>
//   getExtensionApi<CommandServerApi>("pokey.command-server");
