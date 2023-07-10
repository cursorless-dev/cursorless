import { FlashStyle } from "@cursorless/common";
import { flatten, zip } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { RawSelectionTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

export default class Delete implements Action {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    { showDecorations = true } = {},
  ): Promise<ActionReturnValue> {
    // Unify overlapping targets because of overlapping leading and trailing delimiters.
    targets = unifyRemovalTargets(targets);

    if (showDecorations) {
      await flashTargets(ide(), targets, FlashStyle.pendingDelete, (target) =>
        target.getRemovalHighlightRange(),
      );
    }

    const thatTargets = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const edits = targets.map((target) => target.constructRemovalEdit());
        const ranges = edits.map((edit) => edit.range);

        const [updatedRanges] = await performEditsAndUpdateRanges(
          this.rangeUpdater,
          ide().getEditableTextEditor(editor),
          edits,
          [ranges],
        );

        return zip(targets, updatedRanges).map(
          ([target, range]) =>
            new RawSelectionTarget({
              editor: target!.editor,
              isReversed: target!.isReversed,
              contentRange: range!,
            }),
        );
      }),
    );

    return { thatTargets };
  }
}
