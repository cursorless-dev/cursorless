import {
  ExcludableSnapshotField,
  ExtraSnapshotField,
  FakeCommandServerApi,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  ScopeProvider,
  SerializedMarks,
  StoredTargetKey,
  TargetPlainObject,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import {
  StoredTargetMap,
  plainObjectToTarget,
  takeSnapshot,
} from "@cursorless/cursorless-engine";
import { TestHelpers } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { toVscodeEditor } from "./ide/vscode/toVscodeEditor";
import { vscodeApi } from "./vscodeApi";

export function constructTestHelpers(
  commandServerApi: FakeCommandServerApi,
  storedTargets: StoredTargetMap,
  hatTokenMap: HatTokenMap,
  vscodeIDE: VscodeIDE,
  normalizedIde: NormalizedIDE,
  fileSystem: VscodeFileSystem,
  scopeProvider: ScopeProvider,
  injectIde: (ide: IDE) => void,
  runIntegrationTests: () => Promise<void>,
): TestHelpers | undefined {
  return {
    commandServerApi: commandServerApi!,
    ide: normalizedIde,
    injectIde,
    scopeProvider,

    toVscodeEditor,
    fromVscodeEditor(editor: vscode.TextEditor): TextEditor {
      return vscodeIDE.fromVscodeEditor(editor);
    },

    // FIXME: Remove this once we have a better way to get this function
    // accessible from our tests
    takeSnapshot(
      excludeFields: ExcludableSnapshotField[],
      extraFields: ExtraSnapshotField[],
      editor: TextEditor,
      ide: IDE,
      marks: SerializedMarks | undefined,
    ): Promise<TestCaseSnapshot> {
      return takeSnapshot(
        storedTargets,
        excludeFields,
        extraFields,
        editor,
        ide,
        marks,
        undefined,
        undefined,
      );
    },

    cursorlessTalonStateJsonPath: fileSystem.cursorlessTalonStateJsonPath,
    cursorlessCommandHistoryDirPath: fileSystem.cursorlessCommandHistoryDirPath,

    setStoredTarget(
      editor: TextEditor,
      key: StoredTargetKey,
      targets: TargetPlainObject[] | undefined,
    ): void {
      storedTargets.set(
        key,
        targets?.map((target) => plainObjectToTarget(editor, target)),
      );
    },
    hatTokenMap,
    runIntegrationTests,
    vscodeApi,
  };
}
