import { flatten } from "lodash";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateRanges";
// import { unifyTargets } from "../util/unifyRanges";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";

import {
  createThatMark,
  getContentRange,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
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
    // TODO
    // targets = unifyTargets(targets);

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

function getRemovalRange(target: Target) {
  const removalRange = target.removalRange ?? target.contentRange;
  const delimiterRange =
    target.trailingDelimiterRange ?? target.leadingDelimiterRange;
  return delimiterRange != null
    ? removalRange.union(delimiterRange)
    : removalRange;
}

function getRemovalHighlightRange(target: Target) {
  const removalRange = target.removalRange ?? target.contentRange;
  const delimiterRange =
    target.trailingDelimiterHighlightRange ??
    target.trailingDelimiterRange ??
    target.leadingDelimiterHighlightRange ??
    target.leadingDelimiterRange;
  return delimiterRange != null
    ? removalRange.union(delimiterRange)
    : removalRange;
}
