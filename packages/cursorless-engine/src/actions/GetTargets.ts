import { Target } from "../typings/target.types";
import { ActionReturnValue, SimpleAction } from "./actions.types";

export default class GetTargets implements SimpleAction {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    return {
      returnValue: targets.map(({ contentRange }) => ({
        contentRange,
      })),
      thatTargets: targets,
    };
  }
}
