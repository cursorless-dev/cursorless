/**
 * Describes the behavior of decorations when typing/editing at their edges.
 */
export type DecorationRangeBehavior =
  /**
   * The decoration's range will widen when edits occur at the start or end.
   */
  | "OpenOpen"

  /**
   * The decoration's range will not widen when edits occur at the start of end.
   */
  | "ClosedClosed"

  /**
   * The decoration's range will widen when edits occur at the start, but not at the end.
   */
  | "OpenClosed"

  /**
   * The decoration's range will widen when edits occur at the end, but not at the start.
   */
  | "ClosedOpen";
