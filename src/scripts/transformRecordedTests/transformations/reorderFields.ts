import { TestCaseFixture } from "../../../testUtil/TestCase";

export function reorderFields(
  fixture: TestCaseFixture
): EnforceUndefined<TestCaseFixture> {
  return {
    languageId: fixture.languageId,
    command: fixture.command,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    decorations: fixture.decorations,
    returnValue: fixture.returnValue,
    fullTargets: fixture.fullTargets,
    thrownError: fixture.thrownError,
    postCommandSleepTimeMs: fixture.postCommandSleepTimeMs,
    postEditorOpenSleepTimeMs: fixture.postEditorOpenSleepTimeMs,
  };
}
