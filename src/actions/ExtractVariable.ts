import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { commands } from "vscode";

export default class ExtractVariable implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    await this.graph.actions.setSelection.run([targets]);

    await commands.executeCommand("editor.action.codeAction", {
      kind: "refactor.extract.constant",
      preferred: true,
    });

    return {};
  }
}
