import { flatten } from "lodash";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateRanges";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import {
  createThatMark,
  getContentRange,
  getRemovalHighlightRange,
  getRemovalRange,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
import { unifyTargets } from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

export default class Delete implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    { showDecorations = true, contentOnly = false } = {}
  ): Promise<ActionReturnValue> {
    // Unify overlapping targets.
    targets = unifyTargets(targets);

    if (showDecorations) {
      await displayPendingEditDecorations(
        targets,
        this.graph.editStyles.pendingDelete,
        contentOnly ? getContentRange : getRemovalHighlightRange,
        contentOnly
      );
    }

    const thatMark = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = targets.map(
          contentOnly ? getContentRange : getRemovalRange
        );
        const edits = ranges.map((range) => ({
          range,
          text: "",
        }));

        const [updatedRanges] = await performEditsAndUpdateRanges(
          this.graph.rangeUpdater,
          editor,
          edits,
          [ranges]
        );

        return createThatMark(targets, updatedRanges);
      })
    );

    return { thatMark };
  }
}
