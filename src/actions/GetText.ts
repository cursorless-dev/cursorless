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

  constructor(private graph: Graph, private showDecorations: boolean = true) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    if (this.showDecorations) {
      await displayPendingEditDecorations(
        targets,
        this.graph.editStyles.referenced
      );
    }

    const texts = targets.map((target) =>
      target.selection.editor.document.getText(target.selection.selection)
    );

    return {
      returnValue: texts,
      thatMark: targets.map((target) => target.selection),
    };
  }
}
