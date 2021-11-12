import * as vscode from "vscode";
import { ThatMark } from "../core/ThatMark";
import { SyntaxNode } from "web-tree-sitter";
import { Graph } from "../typings/Types";

export interface CursorlessApi {
  thatMark: ThatMark;
  sourceMark: ThatMark;

  /**
   * The dependency injection graph object used by cursorless. Only exposed during testing
   */
  graph?: Graph;
}

export interface ParseTreeApi {
  getNodeAtLocation(location: vscode.Location): SyntaxNode;
  loadLanguage: (languageId: string) => Promise<boolean>;
}

export interface InboundSignal {
  getVersion(): Promise<string | null>;
}

export interface CommandServerApi {
  signals: {
    prePhrase: InboundSignal;
  };
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
