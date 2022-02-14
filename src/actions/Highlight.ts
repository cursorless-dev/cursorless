import { EditStyleName } from "../core/editStyles";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  TypedSelection,
  Graph,
} from "../typings/Types";
import { clearDecorations, setDecorations } from "../util/editDisplayUtils";

export default class Highlight implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    styleName: EditStyleName = "highlight0"
  ): Promise<ActionReturnValue> {
    const style = this.graph.editStyles[styleName];

    clearDecorations(style);
    await setDecorations(targets, style);

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}
