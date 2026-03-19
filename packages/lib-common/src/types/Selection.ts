import { Position } from "./Position";
import { Range } from "./Range";

export class Selection extends Range {
  /**
   * The position at which the selection starts.
   * This position might be before or after {@link Selection.active active}.
   */
  readonly anchor: Position;

  /**
   * The position of the cursor.
   * This position might be before or after {@link Selection.anchor anchor}.
   */
  readonly active: Position;

  /**
   * Is true if active position is before anchor position.
   */
  get isReversed(): boolean {
    return this.active.isBefore(this.anchor);
  }

  /**
   * Create a selection from two positions.
   *
   * @param anchor A position.
   * @param active A position.
   */
  constructor(anchor: Position, active: Position);

  /**
   * Create a selection from four coordinates.
   *
   * @param anchorLine A zero-based line value.
   * @param anchorCharacter A zero-based character value.
   * @param activeLine A zero-based line value.
   * @param activeCharacter A zero-based character value.
   */
  constructor(
    anchorLine: number,
    anchorCharacter: number,
    activeLine: number,
    activeCharacter: number,
  );

  constructor(...args: any[]) {
    const [anchor, active]: [Position, Position] = (() => {
      // Arguments are two positions
      if (args.length === 2) {
        return args as [Position, Position];
      }

      // Arguments are four numbers
      return [new Position(args[0], args[1]), new Position(args[2], args[3])];
    })();

    super(anchor, active);

    this.anchor = anchor;
    this.active = active;
  }

  /**
   * Create a selection from a range. By default, the selection will not be reversed, but you can set `isReversed` to `true` to create a reversed selection.
   *
   * @param range A range.
   * @param isReversed Whether the selection should be reversed. Defaults to `false`.
   * @returns A selection created from the given range.
   */
  public static fromRange(
    range: Range,
    isReversed: boolean = false,
  ): Selection {
    return isReversed
      ? new Selection(range.end, range.start)
      : new Selection(range.start, range.end);
  }

  /**
   * Check if `other` equals this range.
   *
   * @param other A selection.
   * @return `true` when anchor and active are {@link Position.isEqual equal} to
   * anchor and active of this range.
   */
  public isEqual(other: Selection): boolean {
    return (
      this.anchor.isEqual(other.anchor) && this.active.isEqual(other.active)
    );
  }

  /**
   * Return a concise string representation of the selection. 0-based.
   * @returns concise representation
   **/
  public concise(): string {
    return `${this.anchor.concise()}->${this.active.concise()}`;
  }

  /**
   * Return a concise string representation of the selection. 1-based.
   * @returns concise representation
   **/
  public conciseOneBased(): string {
    return `${this.start.conciseOneBased()}->${this.end.conciseOneBased()}`;
  }

  public toString(): string {
    return this.concise();
  }
}

/**
 * Represents the offsets of a selection, where `anchor` and `active` are zero-based offsets from the start of the document.
 */
export interface SelectionOffsets {
  anchor: number;
  active: number;
}
