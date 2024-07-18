import type {
  IDE,
  NormalizedIDE,
  ScopeProvider,
  TestHelpers,
  TextEditor,
} from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeApi } from "./VscodeApi";

export interface VscodeTestHelpers extends TestHelpers {
  ide: NormalizedIDE;
  injectIde: (ide: IDE) => void;

  scopeProvider: ScopeProvider;

  toVscodeEditor(editor: TextEditor): vscode.TextEditor;
  fromVscodeEditor(editor: vscode.TextEditor): TextEditor;

  runIntegrationTests(): Promise<void>;

  cursorlessTalonStateJsonPath: string;
  cursorlessCommandHistoryDirPath: string;

  /**
   * A thin wrapper around the VSCode API that allows us to mock it for testing.
   */
  vscodeApi: VscodeApi;
}
