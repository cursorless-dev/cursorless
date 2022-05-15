import { Target } from "../typings/target.types";
import { Action, ActionReturnValue, Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { createThatMark, ensureSingleTarget } from "../util/targetUtils";

export default class GetText implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
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
      target.editor.document.getText(target.contentRange)
    );

    return {
      returnValue,
      thatMark: createThatMark(targets),
    };
  }
}
