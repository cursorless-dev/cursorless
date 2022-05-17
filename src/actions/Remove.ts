import { flatten } from "lodash";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
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
import { unifyRemovalTargets } from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

export default class Delete implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    { showDecorations = true, contentOnly = false } = {}
  ): Promise<ActionReturnValue> {
    // Unify overlapping targets because of overlapping leading and trailing delimiters.
    if (!contentOnly) {
      targets = unifyRemovalTargets(targets);
    }

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
        const getRangeCallback = contentOnly
          ? getContentRange
          : getRemovalRange;
        const edits = targets.map((target) => ({
          range: getRangeCallback(target),
          text: "",
        }));
        const ranges = edits.map((edit) => edit.range);

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
