import {
  ExcludableSnapshotField,
  ExtraSnapshotField,
  FakeCommandServerApi,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  ScopeProvider,
  SerializedMarks,
  // StoredTargetKey,
  // TargetPlainObject,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import {
  StoredTargetMap,
  // plainObjectToTarget,
  takeSnapshot,
} from "@cursorless/cursorless-engine";
import { TestHelpers } from "./TestHelpers";
//import * as vscode from "vscode";
import { NeovimFileSystem } from "./ide/neovim/NeovimFileSystem";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
//import { toVscodeEditor } from "./ide/vscode/toNeovimEditor";
//import { vscodeApi } from "./vscodeApi";

export function constructTestHelpers(
  commandServerApi: FakeCommandServerApi,
  storedTargets: StoredTargetMap,
  hatTokenMap: HatTokenMap,
  vscodeIDE: NeovimIDE,
  normalizedIde: NormalizedIDE,
  fileSystem: NeovimFileSystem,
  scopeProvider: ScopeProvider,
  injectIde: (ide: IDE) => void,
  runIntegrationTests: () => Promise<void>,
): TestHelpers | undefined {
  return {
    commandServerApi: commandServerApi!,
    ide: normalizedIde,
    injectIde,
    scopeProvider,

    //toVscodeEditor,

    // FIXME: Remove this once we have a better way to get this function
    // accessible from our tests
    takeSnapshot(
      excludeFields: ExcludableSnapshotField[],
      extraFields: ExtraSnapshotField[],
      editor: TextEditor,
      ide: IDE,
      marks: SerializedMarks | undefined,
      forceRealClipboard: boolean,
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
        forceRealClipboard ? vscodeIDE.clipboard : undefined,
      );
    },

    cursorlessTalonStateJsonPath: fileSystem.cursorlessTalonStateJsonPath,
    cursorlessCommandHistoryDirPath: fileSystem.cursorlessCommandHistoryDirPath,

    //   setStoredTarget(
    //     editor: vscode.TextEditor,
    //     key: StoredTargetKey,
    //     targets: TargetPlainObject[] | undefined,
    //   ): void {
    //     storedTargets.set(
    //       key,
    //       targets?.map((target) =>
    //         plainObjectToTarget(vscodeIDE.fromVscodeEditor(editor), target),
    //       ),
    //     );
    //   },
    hatTokenMap,
    runIntegrationTests,
    //vscodeApi,
  };
}
