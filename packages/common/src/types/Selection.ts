import { Position, Range } from "..";

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
   * Return a concise string representation of the selection
   * @returns concise representation
   **/
  public concise(): string {
    return `${this.anchor.concise()}->${this.active.concise()}`;
  }
}
