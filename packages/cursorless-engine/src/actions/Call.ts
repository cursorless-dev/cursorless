import { Target } from "../typings/target.types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Actions } from "./Actions";
import { Action, ActionReturnValue } from "./actions.types";

export default class Call implements Action {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run([sources, destinations]: [
    Target[],
    Target[],
  ]): Promise<ActionReturnValue> {
    ensureSingleTarget(sources);

    const { returnValue: texts } = await this.actions.getText.run([sources], {
      showDecorations: false,
    });

    // NB: We unwrap and then rewrap the return value here so that we don't include the source mark
    const { thatSelections: thatMark } =
      await this.actions.wrapWithPairedDelimiter.run(
        [destinations],
        texts[0] + "(",
        ")",
      );

    return { thatSelections: thatMark };
  }
}
