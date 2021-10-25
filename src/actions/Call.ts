import {
  Action,
  ActionReturnValue,
  ActionPreferences,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";

export default class Call implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([sources, destinations]: [
    TypedSelection[],
    TypedSelection[]
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
