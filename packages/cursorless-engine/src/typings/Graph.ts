import { CommandServerApi } from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";

export interface Graph {
  /**
   * This component can be used to register a list of ranges to keep up to date
   * as the document changes
   */
  readonly rangeUpdater: RangeUpdater;

  /**
   * API object for interacting with the command server, if it exists
   */
  readonly commandServerApi: CommandServerApi | null;
}
