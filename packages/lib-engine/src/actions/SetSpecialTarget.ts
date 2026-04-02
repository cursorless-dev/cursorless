import type { StoredTargetKey } from "@cursorless/lib-common";
import type { Target } from "../typings/target.types";
import type { SimpleAction, ActionReturnValue } from "./actions.types";

export class SetSpecialTarget implements SimpleAction {
  noAutomaticTokenExpansion = true;

  constructor(private key: StoredTargetKey) {
    this.run = this.run.bind(this);
  }

  run(targets: Target[]): Promise<ActionReturnValue> {
    return Promise.resolve({
      thatTargets: targets,
      [`${this.key}Targets`]: targets,
    });
  }
}
