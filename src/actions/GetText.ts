import { FlashStyle } from "../libs/common/ide/types/FlashDescriptor";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ensureSingleTarget, flashTargets } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class GetText implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    {
      showDecorations = true,
      ensureSingleTarget: doEnsureSingleTarget = false,
    } = {},
  ): Promise<ActionReturnValue> {
    if (showDecorations) {
      await flashTargets(ide(), targets, FlashStyle.referenced);
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
