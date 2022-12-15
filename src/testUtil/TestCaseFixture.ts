import type { CommandLatest } from "../core/commandRunner/typings/command.types";
import type { SpyIDERecordedValues } from "../libs/common/ide/spy/SpyIDE";
import type { TargetDescriptor } from "../core/commandRunner/typings/targetDescriptor.types";
import type { TestCaseSnapshot } from "../libs/vscode-common/testUtil/takeSnapshot";
import type { PositionPlainObject } from "../libs/vscode-common/testUtil/toPlainObject";

export type TestCaseCommand = CommandLatest;
export interface PlainTestDecoration {
  name: string;
  type: "token" | "line";
  start: PositionPlainObject;
  end: PositionPlainObject;
}

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
  /**
   * Expected decorations in the test case, for example highlighting deletions in red.
   */
  decorations?: PlainTestDecoration[];
  ide?: SpyIDERecordedValues;
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
