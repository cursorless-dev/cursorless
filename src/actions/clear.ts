import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { ensureSingleEditor } from "../targetUtils";
import { setSelectionsAndFocusEditor } from "../setSelectionsAndFocusEditor";

export default class Clear implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const { thatMark } = await this.graph.actions.delete.run([targets]);

    if (thatMark != null) {
      await setSelectionsAndFocusEditor(
        editor,
        thatMark.map(({ selection }) => selection)
      );
    }

    return { thatMark };
  }
}
