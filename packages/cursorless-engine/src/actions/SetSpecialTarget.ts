import { StoredTargetKey } from "@cursorless/common";
import { Target } from "../typings/target.types";
import { SimpleAction, ActionReturnValue } from "./actions.types";

export class SetSpecialTarget implements SimpleAction {
  noAutomaticTokenExpansion = true;

  constructor(private key: StoredTargetKey) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    return {
      thatTargets: targets,
      [`${this.key}Targets`]: targets,
    };
  }
}
