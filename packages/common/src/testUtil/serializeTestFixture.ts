import { TestCaseFixtureLegacy } from "../types/TestCaseFixture";
import { EnforceUndefined } from "../util/typeUtils";
import { serialize } from "./serialize";

function reorderFields(
  fixture: TestCaseFixtureLegacy,
): EnforceUndefined<TestCaseFixtureLegacy> {
  return {
    languageId: fixture.languageId,
    postEditorOpenSleepTimeMs: fixture.postEditorOpenSleepTimeMs,
    postCommandSleepTimeMs: fixture.postCommandSleepTimeMs,
    command: fixture.command,
    spokenFormError: fixture.spokenFormError,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    returnValue: fixture.returnValue,
    thrownError: fixture.thrownError,
    ide: fixture.ide,
  };
}

export function serializeTestFixture(fixture: TestCaseFixtureLegacy): string {
  return serialize(reorderFields(fixture));
}
