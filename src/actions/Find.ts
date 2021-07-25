import {
  Action,
  ActionReturnValue,
  ActionPreferences,
  Graph,
  TypedSelection,
} from "../Types";
import { commands } from "vscode";
import { ensureSingleTarget } from "../targetUtils";

export class FindInFiles implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const { returnValue, thatMark } = await this.graph.actions.getText.run([
      targets,
    ]);

    await commands.executeCommand("workbench.action.findInFiles", {
      query: returnValue[0],
    });

    return { returnValue: null, thatMark };
  }
}
