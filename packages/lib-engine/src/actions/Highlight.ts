import type { HighlightId, IDE } from "@cursorless/lib-common";
import type { Target } from "../typings/target.types";
import {
  runOnTargetsForEachEditor,
  toGeneralizedRange,
} from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class Highlight {
  constructor(private ide: IDE) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    highlightId?: HighlightId,
  ): Promise<ActionReturnValue> {
    if (this.ide.capabilities.commands["highlight"] == null) {
      throw Error(`The highlight action is not supported by your ide`);
    }

    if (targets.length === 0) {
      // Special case to clear highlights for all editors when user says
      // "highlight nothing"
      await Promise.all(
        this.ide.visibleTextEditors.map((editor) =>
          this.ide.setHighlightRanges(highlightId, editor, []),
        ),
      );
    } else {
      await runOnTargetsForEachEditor(targets, (editor, targets) =>
        this.ide.setHighlightRanges(
          highlightId,
          editor,
          targets.map((target) =>
            toGeneralizedRange(target, target.contentRange),
          ),
        ),
      );
    }

    return {
      thatTargets: targets,
    };
  }
}
