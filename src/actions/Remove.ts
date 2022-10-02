import { flatten } from "lodash";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

export default class Delete implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    { showDecorations = true } = {}
  ): Promise<ActionReturnValue> {
    // Unify overlapping targets because of overlapping leading and trailing delimiters.
    targets = unifyRemovalTargets(targets);

    if (showDecorations) {
      await this.graph.editStyles.displayPendingEditDecorations(
        targets,
        this.graph.editStyles.pendingDelete,
        (target) => target.getRemovalHighlightRange()
      );
    }

    const thatMark = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const edits = targets.map((target) => target.constructRemovalEdit());
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

    return { thatSelections: thatMark };
  }
}
