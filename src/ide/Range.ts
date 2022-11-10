import type IPosition from "../libs/common/ide/types/Position";
import type IRange from "../libs/common/ide/types/Range";
import Position from "./Position";

export default class Range implements IRange {
  /**
   * The start position. It is before or equal to {@link Range.end end}.
   */
  readonly start: IPosition;

  /**
   * The end position. It is after or equal to {@link Range.start start}.
   */
  readonly end: IPosition;

  /**
   * Create a new range from two positions. If `start` is not
   * before or equal to `end`, the values will be swapped.
   *
   * @param start A position.
   * @param end A position.
   */
  constructor(start: IPosition, end: IPosition);

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

  constructor(
    a: number | Position,
    b: number | Position,
    c?: number,
    d?: number,
  ) {
    const [start, end] = _getPositionsFromRangeArguments(
      //  TODO: Sort this mess out
      a as number,
      b as number,
      c!,
      d!,
    );

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

export function _getPositionsFromRangeArguments(
  start: IPosition,
  end: IPosition,
): [IPosition, IPosition];

export function _getPositionsFromRangeArguments(
  startLine: number,
  startCharacter: number,
  endLine: number,
  endCharacter: number,
): [IPosition, IPosition];

export function _getPositionsFromRangeArguments(
  ...args: any[]
): [IPosition, IPosition] {
  // Arguments are two positions
  if (args.length === 2) {
    return args as [IPosition, IPosition];
  }

  // Arguments are four numbers
  return [new Position(args[0], args[1]), new Position(args[2], args[3])];
}
