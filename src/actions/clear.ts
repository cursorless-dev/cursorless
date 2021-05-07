import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { ensureSingleEditor } from "../targetUtils";

export default class Clear implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const { thatMark } = await this.graph.actions.delete.run([targets]);

    editor.selections = thatMark.map(({ selection }) => selection);

    return { returnValue: null, thatMark };
  }
}
