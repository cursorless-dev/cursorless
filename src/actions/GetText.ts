import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { createThatMark, ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

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

    return {
      returnValue: targets.map((target) => target.getContentText()),
      thatMark: createThatMark(targets),
    };
  }
}
