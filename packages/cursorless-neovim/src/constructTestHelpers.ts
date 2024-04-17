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
  CommandApi,
  StoredTargetMap,
  plainObjectToTarget,
  takeSnapshot,
} from "@cursorless/cursorless-engine";
import { TestHelpers } from "./TestHelpers";
import { NeovimFileSystem } from "./ide/neovim/NeovimFileSystem";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";

export function constructTestHelpers(
  commandApi: CommandApi,
  commandServerApi: FakeCommandServerApi,
  storedTargets: StoredTargetMap,
  hatTokenMap: HatTokenMap,
  neovimIDE: NeovimIDE,
  normalizedIde: NormalizedIDE,
  fileSystem: NeovimFileSystem,
  scopeProvider: ScopeProvider,
  injectIde: (ide: IDE) => void,
  runIntegrationTests: () => Promise<void>,
): TestHelpers | undefined {
  return {
    commandApi: commandApi!,
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
        forceRealClipboard ? neovimIDE.clipboard : undefined,
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
    //vscodeApi,
  };
}
