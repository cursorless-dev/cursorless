import type {
  ExcludableSnapshotField,
  ExtraSnapshotField,
  IDE,
  SerializedMarks,
  TestCaseSnapshot,
  TestHelpers,
  TextEditor,
} from "@cursorless/common";
import type { TalonJsTestHelpers } from "@cursorless/cursorless-everywhere-talon-core";
import { takeSnapshot } from "@cursorless/test-case-recorder";

export function constructTestHelpers(
  testHelpers: TalonJsTestHelpers,
): TestHelpers {
  return {
    ...testHelpers,
    takeSnapshot(
      excludeFields: ExcludableSnapshotField[],
      extraFields: ExtraSnapshotField[],
      editor: TextEditor,
      ide: IDE,
      marks: SerializedMarks | undefined,
    ): Promise<TestCaseSnapshot> {
      return takeSnapshot(
        testHelpers.storedTargets,
        excludeFields,
        extraFields,
        editor,
        ide,
        marks,
        undefined,
        undefined,
      );
    },
  };
}
