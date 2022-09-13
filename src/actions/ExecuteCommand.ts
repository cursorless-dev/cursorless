import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { Action, ActionReturnValue } from "./actions.types";
import CommandAction, { CommandOptions } from "./CommandAction";

/**
 * This is just a wrapper for {@link CommandAction} that allows the commands string without an options object.
 * Should only be used by the API. Internally go directly to {@link CommandAction}
 */
export default class ExecuteCommand implements Action {
  private commandAction: CommandAction;

  constructor(graph: Graph) {
    this.commandAction = new CommandAction(graph);
  }

  async run(
    targets: [Target[]],
    command: string,
    args: CommandOptions = {}
  ): Promise<ActionReturnValue> {
    return this.commandAction.run(targets, { ...args, command });
  }
}
