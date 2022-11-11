import Position from "./Position";

export default class Range {
  /**
   * The start position. It is before or equal to {@link Range.end end}.
   */
  readonly start: Position;

  /**
   * The end position. It is after or equal to {@link Range.start start}.
   */
  readonly end: Position;

  /**
   * Create a new empty range.
   *
   * @param position A position.
   */
  constructor(position: Position);

  /**
   * Create a new range from two positions. If `start` is not
   * before or equal to `end`, the values will be swapped.
   *
   * @param start A position.
   * @param end A position.
   */
  constructor(start: Position, end: Position);

  /**
   * Create a new range from number coordinates. It is a shorter equivalent of
   * using `new Range(new Position(startLine, startCharacter), new Position(endLine, endCharacter))`
   *
   * @param startLine A zero-based line value.
   * @param startCharacter A zero-based character value.
   * @param endLine A zero-based line value.
   * @param endCharacter A zero-based character value.
   */
  constructor(
    startLine: number,
    startCharacter: number,
    endLine: number,
    endCharacter: number,
  );

  constructor(...args: any[]) {
    const [start, end] = (() => {
      // Arguments are one positions
      if (args.length === 1) {
        return [args[0], args[0]];
      }

      // Arguments are two positions
      if (args.length === 2) {
        return args;
      }

      // Arguments are four numbers
      return [new Position(args[0], args[1]), new Position(args[2], args[3])];
    })();

    // Ranges are always non-reversed
    if (start.isBefore(end)) {
      this.start = start;
      this.end = end;
    } else {
      this.start = end;
      this.end = start;
    }
  }
}
