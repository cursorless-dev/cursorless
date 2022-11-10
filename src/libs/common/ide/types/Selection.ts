import type Range from "./Range";

export default interface Selection extends Range {
  /**
   * Is true if active position is before anchor position.
   */
  readonly isReversed: boolean;
}
