import type {
  IDE,
  NormalizedIDE,
  ScopeProvider,
  TestHelpers,
  TextEditor,
} from "@cursorless/common";
import type * as vscode from "vscode";
import type { VscodeApi } from "./VscodeApi";
import type { SpyWebViewEvent } from "./SpyWebViewEvent";

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
   * Returns the event log for the VSCode tutorial component. Used to test that
   * the VSCode side of the tutorial is sending messages to the webview, and
   * that the webview is sending messages back to the VSCode side. Note that
   * this log is maintained by the VSCode side, not the webview side, so
   * `messageSent` means that the VSCode side sent a message to the webview, and
   * `messageReceived` means that the VSCode side received a message from the
   * webview.
   */
  getTutorialWebviewEventLog(): SpyWebViewEvent[];

  /**
   * A thin wrapper around the VSCode API that allows us to mock it for testing.
   */
  vscodeApi: VscodeApi;
}
