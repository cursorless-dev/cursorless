import { TestCaseFixture } from "../../../testUtil/TestCaseFixture";

export function reorderFields(fixture: TestCaseFixture) {
  return {
    languageId: fixture.languageId,
    command: fixture.command,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    returnValue: fixture.returnValue,
    fullTargets: fixture.fullTargets,
  };
}
