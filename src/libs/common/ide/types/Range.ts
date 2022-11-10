import type Position from "./Position";

export default interface Range {
  /**
   * The start position. It is before or equal to {@link Range.end end}.
   */
  readonly start: Position;

  /**
   * The end position. It is after or equal to {@link Range.start start}.
   */
  readonly end: Position;
}
