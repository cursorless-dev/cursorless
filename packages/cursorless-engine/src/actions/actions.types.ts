import type { SimpleActionName } from "@cursorless/common";
import type { ModifierStage } from "../processTargets/PipelineStages.types";
import type { SelectionWithEditor } from "../typings/Types";
import type { Destination, Target } from "../typings/target.types";

/**
 * To be returned by {@link Action.run}
 */
export interface ActionReturnValue {
  /**
   * The value that should be returned to the caller of the command
   */
  returnValue?: any;

  /**
   * A list of selections that will become the `that` mark for the next command.
   * The given selections will be wrapped in {@link UntypedTarget}s. This
   * attribute is provided for convenience. Mutually exclusive with
   * {@link thatTargets}
   */
  thatSelections?: SelectionWithEditor[];

  /**
   * A list of targets that will become the `that` mark for the next command.
   * Mutually exclusive with {@link thatSelections}
   */
  thatTargets?: Target[];

  /**
   * A list of selections that will become the `source` mark for the next command.
   * The given selections will be wrapped in {@link UntypedTarget}s. This
   * attribute is provided for convenience. Mutually exclusive with {@link sourceTargets}
   */
  sourceSelections?: SelectionWithEditor[];

  /**
   * A list of targets that will become the `source` mark for the next command.
   * Mutually exclusive with {@link sourceSelections}
   */
  sourceTargets?: Target[];

  /**
   * A list of targets that will be used by the "instance" modifier in the next command
   * to determine either the range for "every", or the start point for "next"
   */
  instanceReferenceTargets?: Target[];
}

export interface Action {
  run(targets: Target[][], ...args: any[]): Promise<ActionReturnValue>;

  /**
   * Used to define stages that should be run before the final positional stage, if there is one
   * @param args Extra args to command
   */
  getPrePositionStages?(...args: any[]): ModifierStage[];

  /**
   * Used to define final stages that should be run at the end of the pipeline before the action
   * @param args Extra args to command
   */
  getFinalStages?(...args: any[]): ModifierStage[];
}

/**
 * Keeps a map from action names to objects that implement the given action
 */
export interface ActionRecord extends Record<SimpleActionName, Action> {
  replaceWithTarget: {
    run(
      sources: Target[],
      destinations: Destination[],
    ): Promise<ActionReturnValue>;
  };
  moveToTarget: {
    run(
      sources: Target[],
      destinations: Destination[],
    ): Promise<ActionReturnValue>;
  };
  swapTargets: {
    run(target1: Target[], target2: Target[]): Promise<ActionReturnValue>;
  };
}
