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
  ): Promise<TestCaseSnapshot>;

  runIntegrationTests(): Promise<void>;

  cursorlessTalonStateJsonPath: string;
  cursorlessCommandHistoryDirPath: string;

  /**
   * A thin wrapper around the VSCode API that allows us to mock it for testing.
   */
  vscodeApi: VscodeApi;
}
