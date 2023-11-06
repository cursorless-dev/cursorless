import { DecoratedSymbolMark, ReadOnlyHatMap } from "@cursorless/common";
import { CommandRunner } from "../CommandRunner";
import { RecordTestCaseCommandOptions } from "./RecordTestCaseCommandOptions";

/**
 * Used for recording test cases
 */
export interface TestCaseRecorder {
  toggle: (
    options?: RecordTestCaseCommandOptions,
  ) => Promise<{ startTimestampISO: string } | null | undefined>;
  recordOneThenPause: (
    options?: RecordTestCaseCommandOptions,
  ) => Promise<{ startTimestampISO: string } | null | undefined>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  takeSnapshot: (
    outPath: string,
    metadata: unknown,
    targetedMarks: DecoratedSymbolMark[],
    usePrePhraseSnapshot: boolean,
  ) => Promise<void>;
  isActive: () => boolean;
  wrapCommandRunner(
    readableHatMap: ReadOnlyHatMap,
    runner: CommandRunner,
  ): CommandRunner;
}
