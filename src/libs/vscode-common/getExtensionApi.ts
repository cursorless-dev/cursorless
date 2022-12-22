import * as vscode from "vscode";
import type { SyntaxNode } from "web-tree-sitter";
import type { ThatMark } from "../../core/ThatMark";
import type { SnippetMap } from "../../typings/snippet";
import type { Target } from "../../typings/target.types";
import type { Graph } from "../../typings/Types";
import type NormalizedIDE from "../common/ide/normalized/NormalizedIDE";
import type { IDE } from "../common/ide/types/ide.types";
import type { TargetPlainObject } from "./testUtil/toPlainObject";

interface TestHelpers {
  graph: Graph;
  ide: NormalizedIDE;
  injectIde: (ide: IDE) => void;

  // FIXME: Remove this once we have a better way to get this function
  // accessible from our tests
  plainObjectToTarget(
    editor: vscode.TextEditor,
    plainObject: TargetPlainObject,
  ): Target;
}

export interface CursorlessApi {
  thatMark: ThatMark;
  sourceMark: ThatMark;

  testHelpers: TestHelpers | undefined;

  experimental: {
    registerThirdPartySnippets: (
      extensionId: string,
      snippets: SnippetMap,
    ) => void;
  };
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
