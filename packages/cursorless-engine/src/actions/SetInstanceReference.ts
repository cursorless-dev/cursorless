import { Target } from "../typings/target.types";
import { SimpleAction, ActionReturnValue } from "./actions.types";

export class SetInstanceReference implements SimpleAction {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    return {
      thatTargets: targets,
      instanceReferenceTargets: targets,
    };
  }
}
