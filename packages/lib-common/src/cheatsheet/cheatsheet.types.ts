export interface CheatsheetVariation {
  spokenForm: string;
  description: string;
}

export interface CheatsheetItem {
  id: string;
  type: string;
  variations: CheatsheetVariation[];
}

export interface CheatsheetSection {
  name: string;
  id: string;
  items: CheatsheetItem[];
}

export interface CheatsheetInfo {
  sections: CheatsheetSection[];
}

interface CheatSheetCommandArgV0 {
  version: 0;

  /** The file to write the cheatsheet to. */
  outputPath: string;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   */
  spokenFormInfo: CheatsheetInfo;
}

/** The extension assembles the cheatsheet from the Talon state file. */
interface CheatSheetCommandArgV1 {
  version: 1;

  /** The file to write the cheatsheet to. */
  outputPath: string;
}

export type CheatSheetCommandArg =
  | CheatSheetCommandArgV0
  | CheatSheetCommandArgV1;
