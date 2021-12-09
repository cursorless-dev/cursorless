import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import CommandAction from "./CommandAction";

export default class RunCommandOnSelection implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];
  private commandAction: CommandAction;

  constructor(graph: Graph) {
    this.run = this.run.bind(this);
    this.commandAction = new CommandAction(graph);
  }

  async run(
    targets: [TypedSelection[]],
    command: string
  ): Promise<ActionReturnValue> {
    return this.commandAction.run(targets, { command });
  }
}
