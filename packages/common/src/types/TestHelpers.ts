import type { FakeCommandServerApi } from "../FakeCommandServerApi";
import type { IDE } from "../ide/types/ide.types";
import type {
  ExcludableSnapshotField,
  ExtraSnapshotField,
  TestCaseSnapshot,
} from "../testUtil/TestCaseSnapshot";
import type { SerializedMarks, TargetPlainObject } from "../util/toPlainObject";
import type { HatTokenMap } from "./HatTokenMap";
import type { TextEditor } from "./TextEditor";

export interface TestHelpers {
  hatTokenMap: HatTokenMap;

  // FIXME: Remove this once we have a better way to get this function
  // accessible from our tests
  takeSnapshot(
    excludeFields: ExcludableSnapshotField[],
    extraFields: ExtraSnapshotField[],
    editor: TextEditor,
    ide: IDE,
    marks: SerializedMarks | undefined,
  ): Promise<TestCaseSnapshot>;

  setStoredTarget(
    editor: TextEditor,
    key: string,
    targets: TargetPlainObject[] | undefined,
  ): void;

  commandServerApi: FakeCommandServerApi;
}
