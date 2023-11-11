import { Command, CommandLatest } from "..";
import { TestCaseSnapshot } from "../testUtil/TestCaseSnapshot";
import { PlainSpyIDERecordedValues } from "../testUtil/spyToPlainObject";

export type ThrownError = {
  name: string;
};

interface TestCaseFixtureBase {
  languageId: string;
  postEditorOpenSleepTimeMs?: number;
  postCommandSleepTimeMs?: number;
  spokenFormError?: string;

  /**
   * A list of marks to check in the case of navigation map test otherwise undefined
   */
  marksToCheck?: string[];

  initialState: TestCaseSnapshot;

  ide?: PlainSpyIDERecordedValues;
  /** The final state after a command is issued. Undefined if we are testing a non-match(error) case. */
  finalState?: TestCaseSnapshot;
  /** Used to assert if an error has been thrown. */
  thrownError?: ThrownError;

  /**
   * The return value of the command. Will be undefined when we have recorded an
   * error test case.
   */
  returnValue?: unknown;
}

export interface TestCaseFixture extends TestCaseFixtureBase {
  command: CommandLatest;
}

export interface TestCaseFixtureLegacy extends TestCaseFixtureBase {
  command: Command;
}
