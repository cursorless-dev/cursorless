import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import displayPendingEditDecorations from "../editDisplayUtils";
import { ensureSingleTarget } from "../targetUtils";

export default class GetText implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    {
      showDecorations = true,
      ensureSingleTarget: doEnsureSingleTarget = false,
    } = {}
  ): Promise<ActionReturnValue> {
    if (showDecorations) {
      await displayPendingEditDecorations(
        targets,
        this.graph.editStyles.referenced
      );
    }
    if (doEnsureSingleTarget) {
      ensureSingleTarget(targets);
    }

    const returnValue = targets.map((target) =>
      target.selection.editor.document.getText(target.selection.selection)
    );

    return {
      returnValue,
      thatMark: targets.map((target) => target.selection),
    };
  }
}
