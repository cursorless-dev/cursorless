/**
 * Describes the behavior of ranges when typing/editing at their edges.
 */
export enum RangeExpansionBehavior {
  /**
   * The decoration's range will widen when edits occur at the start or end.
   */
  openOpen = 0,
  /**
   * The decoration's range will not widen when edits occur at the start of end.
   */
  closedClosed = 1,
  /**
   * The decoration's range will widen when edits occur at the start, but not at the end.
   */
  openClosed = 2,
  /**
   * The decoration's range will widen when edits occur at the end, but not at the start.
   */
  closedOpen = 3,
}
