import {
  Action,
  ActionReturnValue,
  ActionPreferences,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { commands } from "vscode";
import { ensureSingleTarget } from "../util/targetUtils";

export class FindInFiles implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const {
      returnValue: [query],
      thatMark,
    } = await this.graph.actions.getText.run([targets]);

    await commands.executeCommand("workbench.action.findInFiles", {
      query,
    });

    return { thatMark };
  }
}
