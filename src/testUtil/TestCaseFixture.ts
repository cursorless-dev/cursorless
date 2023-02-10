import type { CommandLatest } from "../core/commandRunner/typings/command.types";
import { PlainSpyIDERecordedValues } from "../libs/common/testUtil/toPlainObject";
import type { TestCaseSnapshot } from "../libs/vscode-common/testUtil/takeSnapshot";
import type { TargetDescriptor } from "../typings/TargetDescriptor";

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

  /** Inferred full targets added for context; not currently used in testing */
  fullTargets: TargetDescriptor[];
};
