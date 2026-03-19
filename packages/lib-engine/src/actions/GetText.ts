import type { GetTextActionOptions, IDE } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import type { Target } from "../typings/target.types";
import { ensureSingleTarget, flashTargets } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class GetText {
  constructor(private ide: IDE) {
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
      await flashTargets(this.ide, targets, FlashStyle.referenced);
    }

    if (doEnsureSingleTarget) {
      ensureSingleTarget(targets);
    }

    return {
      returnValue: targets.map((target) => target.contentText),
      thatTargets: targets,
    };
  }
}
