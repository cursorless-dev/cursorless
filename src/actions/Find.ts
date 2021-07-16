import {
  Action,
  ActionReturnValue,
  ActionPreferences,
  Graph,
  TypedSelection,
} from "../Types";
import { commands } from "vscode";

class FindBase implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private command: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const { returnValue, thatMark } = await this.graph.actions.getText.run([
      targets,
    ]);

    await commands.executeCommand(this.command, {
      query: returnValue,
    });

    return { returnValue: null, thatMark };
  }
}

export class FindInFiles extends FindBase {
  constructor(graph: Graph) {
    super(graph, "workbench.action.findInFiles");
  }
}
