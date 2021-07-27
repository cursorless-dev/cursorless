import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import {
  performInsideAdjustment,
  performOutsideAdjustment,
} from "../performInsideOutsideAdjustment";

export default class Cut implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: null }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await this.graph.actions.copy.run([targets.map(performInsideAdjustment)]);

    const { thatMark } = await this.graph.actions.delete.run([
      targets.map(performOutsideAdjustment),
    ]);

    return {
      returnValue: null,
      thatMark,
    };
  }
}
