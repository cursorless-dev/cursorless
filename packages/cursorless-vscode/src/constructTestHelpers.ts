import type {
  ExcludableSnapshotField,
  ExtraSnapshotField,
  FakeCommandServerApi,
  FakeTalonSpokenForms,
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
import type { StoredTargetMap } from "@cursorless/cursorless-engine";
import { plainObjectToTarget } from "@cursorless/cursorless-engine";
import type { VscodeTestHelpers } from "@cursorless/vscode-common";
import type * as vscode from "vscode";
import { takeSnapshot } from "@cursorless/test-case-recorder";
import type { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import type { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { toVscodeEditor } from "./ide/vscode/toVscodeEditor";
import { vscodeApi } from "./vscodeApi";
import type { VscodeTutorial } from "./VscodeTutorial";

export function constructTestHelpers(
  commandServerApi: FakeCommandServerApi,
  talonSpokenForms: FakeTalonSpokenForms,
  storedTargets: StoredTargetMap,
  hatTokenMap: HatTokenMap,
  vscodeIDE: VscodeIDE,
  normalizedIde: NormalizedIDE,
  fileSystem: VscodeFileSystem,
  scopeProvider: ScopeProvider,
  injectIde: (ide: IDE) => void,
  runIntegrationTests: () => Promise<void>,
  vscodeTutorial: VscodeTutorial,
): VscodeTestHelpers | undefined {
  return {
    commandServerApi,
    talonSpokenForms,
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
    getTutorialWebviewEventLog() {
      return vscodeTutorial.getEventLog();
    },
  };
}
