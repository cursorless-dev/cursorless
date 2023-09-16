import { Target } from "../typings/target.types";
import { ActionReturnValue } from "./actions.types";

export default class JoinLines {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    // ensureSingleTarget(callees);
    console.log("join lines");
    console.log(targets);
    return {};

    // return { thatSelections: thatMark };
  }
}
