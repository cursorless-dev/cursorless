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
import { NeovimIDE } from "./ide/neovim/NeovimIDE";

export interface TestHelpers {
  ide: NormalizedIDE;
  neovimIDE: NeovimIDE;
  injectIde: (ide: IDE) => void;

  scopeProvider: ScopeProvider;

  hatTokenMap: HatTokenMap;

  commandServerApi: FakeCommandServerApi;

  setStoredTarget(
    editor: TextEditor,
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
}
