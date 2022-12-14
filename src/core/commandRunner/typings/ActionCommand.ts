import { ActionType } from "../../../actions/actions.types";

export interface ActionCommand {
  /**
   * The action to run
   */
  name: ActionType;

  /**
   * A list of arguments expected by the given action.
   */
  args?: unknown[];
}
