import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";

export default class Clear implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const { thatMark } = await this.graph.actions.remove.run([targets]);

    if (thatMark != null) {
      await setSelectionsAndFocusEditor(
        editor,
        thatMark.map(({ selection }) => selection)
      );
    }

    return { thatMark };
  }
}
