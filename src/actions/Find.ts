import { ActionReturnValue, Graph, TypedSelection } from "../Types";
import { commands } from "vscode";
import GetText from "./GetText";

class FindBase extends GetText {
  constructor(graph: Graph, private command: string) {
    super(graph);
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const { returnValue, thatMark } = await super.run([targets]);

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
