import type {
  CommandServerApi,
  ExcludableSnapshotField,
  ExtraSnapshotField,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  SerializedMarks,
  SnippetMap,
  TargetPlainObject,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import * as vscode from "vscode";
import type { SyntaxNode } from "web-tree-sitter";

export interface TestHelpers {
  ide: NormalizedIDE;
  injectIde: (ide: IDE) => void;

  hatTokenMap: HatTokenMap;

  commandServerApi: CommandServerApi;

  toVscodeEditor(editor: TextEditor): vscode.TextEditor;

  setThatMark(
    editor: vscode.TextEditor,
    targets: TargetPlainObject[] | undefined,
  ): void;
  setSourceMark(
    editor: vscode.TextEditor,
    targets: TargetPlainObject[] | undefined,
  ): void;

  // FIXME: Remove this once we have a better way to get this function
  // accessible from our tests
  takeSnapshot(
    excludeFields: ExcludableSnapshotField[],
    extraFields: ExtraSnapshotField[],
    editor: TextEditor,
    ide: IDE,
    marks: SerializedMarks | undefined,
    forceRealClipboard: boolean,
  ): Promise<TestCaseSnapshot>;
}

export interface CursorlessApi {
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
