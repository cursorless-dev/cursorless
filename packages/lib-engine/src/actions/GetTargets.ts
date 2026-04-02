import type { Target } from "../typings/target.types";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export default class GetTargets implements SimpleAction {
  constructor() {
    this.run = this.run.bind(this);
  }

  run(targets: Target[]): Promise<ActionReturnValue> {
    return Promise.resolve({
      returnValue: targets.map(({ contentRange }) => ({
        contentRange,
      })),
      thatTargets: targets,
    });
  }
}
