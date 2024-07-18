import { Position, Selection } from "..";

export class Range {
  /**
   * The start position. It is before or equal to {@link Range.end end}.
   */
  readonly start: Position;

  /**
   * The end position. It is after or equal to {@link Range.start start}.
   */
  readonly end: Position;

  /**
   * Create a new range from two positions.
   * The earlier of `p1` and `p2` will be used as the start position.
   *
   * @param p1 A position.
   * @param p2 A position.
   */
  constructor(p1: Position, p2: Position);

  /**
   * Create a new range from number coordinates.
   * It is equivalent to `new Range(new Position(line1, char1), new Position(line2, char2))`
   *
   * @param line1 A zero-based line value.
   * @param char1 A zero-based character value.
   * @param line2 A zero-based line value.
   * @param char2 A zero-based character value.
   */
  constructor(line1: number, char1: number, line2: number, char2: number);

  constructor(...args: any[]) {
    const [p1, p2]: [Position, Position] = (() => {
      // Arguments are two positions
      if (args.length === 2) {
        return args as [Position, Position];
      }

      // Arguments are four numbers
      return [new Position(args[0], args[1]), new Position(args[2], args[3])];
    })();

    // Ranges are always non-reversed
    if (p1.isBefore(p2)) {
      this.start = p1;
      this.end = p2;
    } else {
      this.start = p2;
      this.end = p1;
    }
  }

  /**
   * `true` if `start` and `end` are equal.
   */
  get isEmpty(): boolean {
    return this.start.isEqual(this.end);
  }

  /**
   * `true` if `start.line` and `end.line` are equal.
   */
  get isSingleLine(): boolean {
    return this.start.line === this.end.line;
  }

  /**
   * Check if `other` equals this range.
   *
   * @param other A range.
   * @return `true` when start and end are {@link Position.isEqual equal} to
   * start and end of this range.
   */
  public isRangeEqual(other: Range): boolean {
    return this.start.isEqual(other.start) && this.end.isEqual(other.end);
  }

  /**
   * Check if a position or a range is contained in this range.
   *
   * @param positionOrRange A position or a range.
   * @return `true` if the position or range is inside or equal
   * to this range.
   */
  public contains(positionOrRange: Position | Range): boolean {
    const [start, end] =
      positionOrRange instanceof Position
        ? [positionOrRange, positionOrRange]
        : [positionOrRange.start, positionOrRange.end];
    return start.isAfterOrEqual(this.start) && end.isBeforeOrEqual(this.end);
  }

  /**
   * Intersect `range` with this range and returns a new range.
   * If the ranges are adjacent but non-overlapping, the resulting range is empty.
   * If the ranges have no overlap and are not adjacent, it returns `undefined`.
   *
   * @param other A range.
   * @return A range of the greater start and smaller end positions. Will
   * return undefined when there is no overlap.
   */
  public intersection(other: Range): Range | undefined {
    const start = this.start.isAfter(other.start) ? this.start : other.start;
    const end = this.end.isBefore(other.end) ? this.end : other.end;
    return start.isBeforeOrEqual(end) ? new Range(start, end) : undefined;
  }

  /**
   * Compute the union of `other` with this range.
   *
   * @param other A range.
   * @return A range of smaller start position and the greater end position.
   */
  public union(other: Range): Range {
    return new Range(
      this.start.isBefore(other.start) ? this.start : other.start,
      this.end.isAfter(other.end) ? this.end : other.end,
    );
  }

  /**
   * Derive a new range from this range.
   * If the resulting range has end before start, they are swapped.
   *
   * @param start A position that should be used as start. The default value is the {@link Range.start current start}.
   * @param end A position that should be used as end. The default value is the {@link Range.end current end}.
   * @return A range derived from this range with the given start and end position.
   */
  public with(start?: Position, end?: Position): Range {
    return new Range(start ?? this.start, end ?? this.end);
  }

  /**
   * Construct a new selection from this range
   * @param isReversed If true active is before anchor
   * @returns A new selection
   */
  public toSelection(isReversed: boolean): Selection {
    return isReversed
      ? new Selection(this.end, this.start)
      : new Selection(this.start, this.end);
  }

  /**
   * Return a concise string representation of the range
   * @returns concise representation
   **/
  public concise(): string {
    return `${this.start.concise()}-${this.end.concise()}`;
  }

  public toString(): string {
    return this.concise();
  }
}
