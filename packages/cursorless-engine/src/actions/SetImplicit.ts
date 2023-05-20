import { Target } from "../typings/target.types";
import { Action, ActionReturnValue } from "./actions.types";

export class SetImplicit implements Action {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    return {
      thatTargets: targets,
      implicitTargets: targets,
    };
  }
}
