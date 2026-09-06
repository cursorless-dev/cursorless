import type {
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
} from "@cursorless/lib-common";
import type { StoredTargetMap } from "@cursorless/lib-engine";
import { plainObjectToTarget } from "@cursorless/lib-engine";
import type {
  NeovimIDE,
  NeovimTestHelpers,
} from "@cursorless/lib-neovim-common";
import { takeSnapshot } from "@cursorless/lib-test-case-recorder";

export function constructTestHelpers(
  commandServerApi: FakeCommandServerApi,
  storedTargets: StoredTargetMap,
  hatTokenMap: HatTokenMap,
  neovimIDE: NeovimIDE,
  normalizedIde: NormalizedIDE,
  scopeProvider: ScopeProvider,
  injectIde: (ide: IDE) => void,
): NeovimTestHelpers | undefined {
  return {
    commandServerApi,
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
  };
}
