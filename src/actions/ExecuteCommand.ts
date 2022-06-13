import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { Action, ActionReturnValue } from "./actions.types";
import CommandAction, { CommandOptions } from "./CommandAction";

export default class ExecuteCommand implements Action {
  private commandAction: CommandAction;

  constructor(graph: Graph) {
    this.run = this.run.bind(this);
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
