import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import displayPendingEditDecorations from "../editDisplayUtils";

export default class GetText implements Action {
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

    const text = targets
      .map((target) =>
        target.selection.editor.document.getText(target.selection.selection)
      )
      .join("\n");

    return {
      returnValue: text,
      thatMark: targets.map((target) => target.selection),
    };
  }
}
