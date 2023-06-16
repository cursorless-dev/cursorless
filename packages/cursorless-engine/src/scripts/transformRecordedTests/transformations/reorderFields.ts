import {
  EnforceUndefined,
  TestCaseFixture,
  TestCaseFixtureLegacy,
} from "@cursorless/common";

export function reorderFields(
  fixture: TestCaseFixture,
): EnforceUndefined<TestCaseFixture>;
export function reorderFields(
  fixture: TestCaseFixtureLegacy,
): EnforceUndefined<TestCaseFixtureLegacy> {
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
