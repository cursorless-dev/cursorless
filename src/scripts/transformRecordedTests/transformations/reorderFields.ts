import { EnforceUndefined } from "../../../packages/common/util/typeUtils";
import { TestCaseFixture } from "../../../packages/cursorless-engine/testCaseRecorder/TestCaseFixture";

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
    fullTargets: fixture.fullTargets,
  };
}
