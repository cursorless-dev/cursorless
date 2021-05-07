import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { performInsideOutsideAdjustment } from "../performInsideOutsideAdjustment";

export default class Cut implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: null }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await this.graph.actions.copy.run([
      targets.map((target) => performInsideOutsideAdjustment(target, "inside")),
    ]);

    const { thatMark } = await this.graph.actions.delete.run([
      targets.map((target) =>
        performInsideOutsideAdjustment(target, "outside")
      ),
    ]);

    return {
      returnValue: null,
      thatMark,
    };
  }
}
