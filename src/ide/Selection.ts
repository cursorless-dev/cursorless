import type Position from "../libs/common/ide/types/Position";
import type ISelection from "../libs/common/ide/types/Selection";
import Range, { _getPositionsFromRangeArguments } from "./Range";

export default class Selection extends Range implements ISelection {
  readonly isReversed: boolean;

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

  constructor(
    a: number | Position,
    b: number | Position,
    c?: number,
    d?: number,
  ) {
    const [anchor, active] = _getPositionsFromRangeArguments(
      //  TODO: Sort this mess out
      a as number,
      b as number,
      c!,
      d!,
    );

    super(anchor, active);

    this.isReversed = active.isBefore(anchor);
  }
}
