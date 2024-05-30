import type {
  ExcludableSnapshotField,
  ExtraSnapshotField,
  FakeCommandServerApi,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  ScopeProvider,
  SerializedMarks,
  TargetPlainObject,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeApi } from "./VscodeApi";
import { SpyWebViewEvent } from "./SpyWebViewEvent";

export interface TestHelpers {
  ide: NormalizedIDE;
  injectIde: (ide: IDE) => void;

  scopeProvider: ScopeProvider;

  hatTokenMap: HatTokenMap;

  commandServerApi: FakeCommandServerApi;

  toVscodeEditor(editor: TextEditor): vscode.TextEditor;

  setStoredTarget(
    editor: vscode.TextEditor,
    key: string,
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
