import type { Target } from "../typings/target.types";
import { ensureSingleTarget } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";

export default class Call {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(callees: Target[], args: Target[]): Promise<ActionReturnValue> {
    ensureSingleTarget(callees);

    const { returnValue: texts } = await this.actions.getText.run(callees, {
      showDecorations: false,
    });

    // NB: We unwrap and then rewrap the return value here so that we don't include the source mark
    const { thatSelections: thatMark } =
      await this.actions.wrapWithPairedDelimiter.run(args, texts[0] + "(", ")");

    return { thatSelections: thatMark };
  }
}
