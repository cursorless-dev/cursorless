import { commands } from "vscode";
import { EditableTarget } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export class FindInFiles implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [EditableTarget[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const {
      returnValue: [query],
      thatTargets,
    } = await this.graph.actions.getText.run([targets]);

    await commands.executeCommand("workbench.action.findInFiles", {
      query,
    });

    return { thatTargets };
  }
}
