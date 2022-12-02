import { commands } from "vscode";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export class FindInFiles implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const { returnValue, thatTargets } = await this.graph.actions.getText.run([
      targets,
    ]);
    const [text] = returnValue as [string];

    let query: string;
    if (text.length > 200) {
      query = text.substring(0, 200);
      ide().messages.showWarning(
        "truncatedSearchText",
        "Search text is longer than 200 characters; truncating",
      );
    } else {
      query = text;
    }

    await commands.executeCommand("workbench.action.findInFiles", {
      query,
    });

    return { thatTargets };
  }
}
