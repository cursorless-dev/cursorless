import { TestCaseSnapshot } from "../testUtil/TestCaseSnapshot";
import { PlainSpyIDERecordedValues } from "../testUtil/toPlainObject";
import { CommandLatest } from "./command/command.types";

export type TestCaseCommand = CommandLatest;

export type ThrownError = {
  name: string;
};

export type TestCaseFixture = {
  languageId: string;
  postEditorOpenSleepTimeMs?: number;
  postCommandSleepTimeMs?: number;
  command: TestCaseCommand;

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
};
