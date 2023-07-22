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
    const [start, end]: [Position, Position] = (() => {
      // Arguments are two positions
      if (args.length === 2) {
        return args as [Position, Position];
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
   * Intersect `range` with this range and returns a new range or `undefined`
   * if the ranges have no overlap.
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
   * Derived a new range from this range.
   *
   * @param start A position that should be used as start. The default value is the {@link Range.start current start}.
   * @param end A position that should be used as end. The default value is the {@link Range.end current end}.
   * @return A range derived from this range with the given start and end position.
   * If start and end are not different `this` range will be returned.
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
   * after returns a zero-width range at the end of this range. 
   */
  public after(): Range {
    return new Range(this.end, this.end);
  }

  /**
   * before returns a zero-width range at the beginning of this range. 
   */
  public before(): Range {
    return new Range(this.start, this.start);
  }
  
}
