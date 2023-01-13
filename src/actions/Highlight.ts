import { HighlightId } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { toGeneralizedRange } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Highlight implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    highlightId: HighlightId = "highlight0",
  ): Promise<ActionReturnValue> {
    if (ide().capabilities.commands["highlight"] == null) {
      throw Error(`The highlight action is not supported by your ide`);
    }

    await ide().setHighlightRanges(
      highlightId,
      targets.map((target) => ({
        editor: target.editor,
        range: toGeneralizedRange(target),
      })),
    );

    return {
      thatTargets: targets,
    };
  }
}
