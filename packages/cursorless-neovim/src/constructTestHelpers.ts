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
} from "@cursorless/cursorless-engine";
import { NeovimIDE, NeovimTestHelpers } from "@cursorless/neovim-common";
import { takeSnapshot } from "@cursorless/test-case-recorder";

export function constructTestHelpers(
  commandServerApi: FakeCommandServerApi,
  storedTargets: StoredTargetMap,
  hatTokenMap: HatTokenMap,
  neovimIDE: NeovimIDE,
  normalizedIde: NormalizedIDE,
  scopeProvider: ScopeProvider,
  injectIde: (ide: IDE) => void,
  runIntegrationTests: () => Promise<void>,
): NeovimTestHelpers | undefined {
  return {
    commandServerApi: commandServerApi!,
    ide: normalizedIde,
    neovimIDE,
    injectIde,
    scopeProvider,

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
  };
}
