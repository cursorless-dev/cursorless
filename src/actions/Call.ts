import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Call implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([sources, destinations]: [
    Target[],
    Target[]
  ]): Promise<ActionReturnValue> {
    ensureSingleTarget(sources);

    const { returnValue: texts } = await this.graph.actions.getText.run(
      [sources],
      {
        showDecorations: false,
      }
    );

    return this.graph.actions.wrapWithPairedDelimiter.run(
      [destinations],
      texts[0] + "(",
      ")"
    );
  }
}
