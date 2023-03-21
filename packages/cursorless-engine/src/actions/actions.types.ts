import type { ModifierStage } from "../processTargets/PipelineStages.types";
import type { Target } from "../typings/target.types";
import type { SelectionWithEditor } from "../typings/Types";
import type { ActionType } from "@cursorless/common";

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

export type ActionRecord = Record<ActionType, Action>;
