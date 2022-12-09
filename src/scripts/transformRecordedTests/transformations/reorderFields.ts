import { TestCaseFixture } from "../../../testUtil/TestCaseFixture";

export function reorderFields(
  fixture: TestCaseFixture,
): EnforceUndefined<TestCaseFixture> {
  return {
    languageId: fixture.languageId,
    command: fixture.command,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    decorations: fixture.decorations,
    returnValue: fixture.returnValue,
    thrownError: fixture.thrownError,
    postEditorOpenSleepTimeMs: fixture.postEditorOpenSleepTimeMs,
    postCommandSleepTimeMs: fixture.postCommandSleepTimeMs,
    fullTargets: fixture.fullTargets,
  };
}
