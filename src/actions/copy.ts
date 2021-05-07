import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import displayPendingEditDecorations from "../editDisplayUtils";
import { env } from "vscode";

export default class Copy implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced,
      this.graph.editStyles.referencedLine
    );

    await env.clipboard.writeText(
      targets
        .map((target) =>
          target.selection.editor.document.getText(target.selection.selection)
        )
        .join("\n")
    );

    return {
      returnValue: null,
      thatMark: targets.map((target) => target.selection),
    };
  }
}
