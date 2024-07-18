import { ExtraSnapshotField } from "@cursorless/common";

/**
 * This is the type of the `recordTestCase` command's argument. It is used to
 * specify the options for recording a test case.
 */
export interface RecordTestCaseCommandOptions {
  /**
   * If this is set to `true`, then for each test case that we record, we expect
   * that the user will issue a second command in each phrase, which refers to a
   * decorated mark whose range we'd like to check that it got updated properly
   * during the previous command. We use this functionality in order to check
   * that the token range update works properly. For example, you might say
   * `"chuck second car ox air take air"` to check that removing a character
   * from a token properly updates the token.
   */
  isHatTokenMapTest?: boolean;

  /** If true decorations will be added to the test fixture */
  isDecorationsTest?: boolean;

  /**
   * The directory in which to store the test cases that we record. If left out
   * the user will be prompted to select a directory within the default recorded
   * test case directory.
   */
  directory?: string;

  /**
   * If `true`, don't show a little pop up each time to indicate we've recorded a
   * test case
   */
  isSilent?: boolean;

  extraSnapshotFields?: ExtraSnapshotField[];

  /**
   * Whether to flash a background for calibrating a video recording
   */
  showCalibrationDisplay?: boolean;

  /**
   * Whether we should record a tests which yield errors in addition to tests
   * which do not error.
   */
  recordErrors?: boolean;

  /**
   * Whether to capture the `that` mark returned by the action.
   */
  captureFinalThatMark?: boolean;
}
