import { FlashStyle, GetTextActionOptions } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { ensureSingleTarget, flashTargets } from "../util/targetUtils";
import { ActionReturnValue } from "./actions.types";

export default class GetText {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    {
      showDecorations = true,
      ensureSingleTarget: doEnsureSingleTarget = false,
    }: GetTextActionOptions = {},
  ): Promise<ActionReturnValue> {
    if (showDecorations) {
      await flashTargets(ide(), targets, FlashStyle.referenced);
    }

    if (doEnsureSingleTarget) {
      ensureSingleTarget(targets);
    }

    return {
      returnValue: await Promise.all(
        targets.map(async (target) => await target.contentText),
      ),
      thatTargets: targets,
    };
  }
}
