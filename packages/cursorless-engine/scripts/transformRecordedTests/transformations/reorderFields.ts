import { EnforceUndefined } from "@cursorless/common";
import { TestCaseFixture } from "@cursorless/common";

export function reorderFields(
  fixture: TestCaseFixture,
): EnforceUndefined<TestCaseFixture> {
  return {
    languageId: fixture.languageId,
    command: fixture.command,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    returnValue: fixture.returnValue,
    thrownError: fixture.thrownError,
    ide: fixture.ide,
    postEditorOpenSleepTimeMs: fixture.postEditorOpenSleepTimeMs,
    postCommandSleepTimeMs: fixture.postCommandSleepTimeMs,
  };
}
