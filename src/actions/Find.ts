import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export class FindInWorkspace implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const {
      returnValue: [query],
      thatTargets,
    } = await this.graph.actions.getText.run([targets]);

    await ide().findInWorkspace(query);

    return { thatTargets };
  }
}
