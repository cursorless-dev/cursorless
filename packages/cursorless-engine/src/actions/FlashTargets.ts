import type { IDE } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import type { Target } from "../typings/target.types";
import { flashTargets } from "../util/targetUtils";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export class FlashTargets implements SimpleAction {
  constructor(private ide: IDE) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(this.ide, targets, FlashStyle.referenced);

    return { thatTargets: targets };
  }
}
