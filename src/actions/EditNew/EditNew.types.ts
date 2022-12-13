import type { Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";

/**
 * Internal type to be used for storing a reference to a target that will use an
 * edit action to insert a new target
 */
export interface EditTarget {
  target: Target;

  /**
   * The original index of this target in the original list of targets passed
   * to the action
   */
  index: number;
}

/**
 * Internal representation of the current state.  This action first handles
 * command targets, then edit targets.  This state is used to track cursors,
 * thatTargets, etc as we perform the edits and commands.
 *
 * Note that each field is an array with the same number of items, equal to the
 * number of original targets passed into the action.
 */
export interface State {
  /**
   * This field stores the original targets.
   */
  targets: Target[];

  /**
   * We use this field to track the desired `thatMark` at the end, updating it
   * as necessary.
   */
  thatRanges: Range[];

  /**
   * Where the cursors should be placed.  We update these after each step.
   * They are initially undefined, and we update them as we run commands /
   * perform edits, and the finally use them to set the cursor positions at the
   * end.
   */
  cursorRanges: (Range | undefined)[];
}
