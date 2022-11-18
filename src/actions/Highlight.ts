import { EditStyleName } from "../core/editStyles";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { Action, ActionReturnValue } from "./actions.types";

export default class Highlight implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    styleName: EditStyleName = "highlight0",
  ): Promise<ActionReturnValue> {
    const style = this.graph.editStyles[styleName];

    this.graph.editStyles.clearDecorations(style);
    await this.graph.editStyles.setDecorations(targets, style);

    return {
      thatTargets: targets,
    };
  }
}
