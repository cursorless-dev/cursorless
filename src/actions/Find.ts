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

  constructor(private graph: Graph, private command: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    const query = target.selection.editor.document.getText(
      target.selection.selection
    );

    await commands.executeCommand("workbench.action.findInFiles", { query });

    return { returnValue: null, thatMark: [target.selection] };
  }
}
