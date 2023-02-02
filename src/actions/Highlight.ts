import { HighlightId } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import {
  runOnTargetsForEachEditor,
  toGeneralizedRange,
} from "../util/targetUtils";
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

    if (targets.length === 0) {
      // Special case to clear highlights for the active editor when user says
      // "highlight nothing"
      const { activeTextEditor } = ide();

      if (activeTextEditor == null) {
        throw Error(
          "The `highlight nothing` command requires an active text editor",
        );
      }

      await ide().setHighlightRanges(highlightId, activeTextEditor, []);
    } else {
      await runOnTargetsForEachEditor(targets, (editor, targets) =>
        ide().setHighlightRanges(
          highlightId,
          editor,
          targets.map(toGeneralizedRange),
        ),
      );
    }

    return {
      thatTargets: targets,
    };
  }
}
