import Position from "./Position";
import Range from "./Range";

export default class Selection extends Range {
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
   * Create a new empty selection.
   *
   * @param position A position.
   */
  constructor(position: Position);

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
    const [anchor, active] = (() => {
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

    super(anchor, active);

    this.anchor = anchor;
    this.active = active;
  }
}
