import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { env } from "vscode";

export default class Copy implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const { returnValue, thatMark } = await this.graph.actions.getText.run([
      targets,
    ]);

    await env.clipboard.writeText(returnValue);

    return { returnValue: null, thatMark };
  }
}
