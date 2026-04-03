import * as vscode from "vscode";
import type { Query, Tree } from "web-tree-sitter";
import type { CommandServerApi } from "@cursorless/lib-common";
import type { VscodeTestHelpers } from "./TestHelpers";

export const COMMAND_SERVER_EXTENSION_ID = "pokey.command-server";
const EXTENSION_ID = "pokey.cursorless";

export interface ParseTreeApi {
  loadLanguage(languageId: string): Promise<boolean>;
  getTreeForUri(uri: vscode.Uri): Tree;
  createQuery(languageId: string, source: string): Query | undefined;
}

export interface CursorlessApi {
  testHelpers: VscodeTestHelpers | undefined;
}

async function getExtensionApi<T>(extensionId: string): Promise<T | undefined> {
  const extension = vscode.extensions.getExtension(extensionId);

  if (extension == null) {
    return undefined;
  }

  return (await extension.activate()) as T;
}

async function getExtensionApiStrict<T>(extensionId: string): Promise<T> {
  const extension = await getExtensionApi<T>(extensionId);

  if (extension == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return extension;
}

export function getParseTreeApi(): Promise<ParseTreeApi> {
  return getExtensionApiStrict<ParseTreeApi>("pokey.parse-tree");
}

function getCursorlessApi(): Promise<CursorlessApi> {
  return getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);
}

export async function getTestHelpers(): Promise<VscodeTestHelpers> {
  const cursorlessApi = await getCursorlessApi();

  if (cursorlessApi.testHelpers == null) {
    throw new Error("Test helpers are not available");
  }

  return cursorlessApi.testHelpers;
}

/**
 *
 * @returns Command server API or undefined if not installed
 */
export function getCommandServerApi(): Promise<CommandServerApi | undefined> {
  return getExtensionApi<CommandServerApi>(COMMAND_SERVER_EXTENSION_ID);
}
