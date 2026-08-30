import type { CheatsheetInfo } from "@cursorless/lib-common";

export interface CheatSheetCommandArgV0 {
  /**
   * The version of the cheatsheet command.
   */
  version: 0;

  /** The file to write the cheatsheet to. */
  outputPath: string;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   */
  spokenFormInfo: CheatsheetInfo;
}

export interface CheatSheetCommandArgV1 {
  /** The extension assembles the cheatsheet from the Talon state file. */
  version: 1;

  /** The file to write the cheatsheet to. */
  outputPath: string;
}

export type CheatSheetCommandArg =
  | CheatSheetCommandArgV0
  | CheatSheetCommandArgV1;
