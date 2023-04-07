import { RangeUpdater } from "../core/updateSelections/RangeUpdater";

export interface Graph {
  /**
   * This component can be used to register a list of ranges to keep up to date
   * as the document changes
   */
  readonly rangeUpdater: RangeUpdater;
}
