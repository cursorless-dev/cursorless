import { FlashStyle } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { flashTargets } from "../util/targetUtils";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export class FlashTargets implements SimpleAction {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(ide(), targets, FlashStyle.referenced);

    return { thatTargets: targets };
  }
}
