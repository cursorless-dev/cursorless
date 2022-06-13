import { commands } from "vscode";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class ExtractVariable implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    await this.graph.actions.setSelection.run([targets]);

    await commands.executeCommand("editor.action.codeAction", {
      kind: "refactor.extract.constant",
      preferred: true,
    });

    return {};
  }
}
