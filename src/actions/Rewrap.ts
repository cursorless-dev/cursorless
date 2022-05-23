import { flatten } from "lodash";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph, ProcessedTargetsContext } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Rewrap implements Action {
  getFinalStages = () => [
    {
      run(context: ProcessedTargetsContext, target: Target): Target[] {
        return target.getBoundary(context);
      },
    },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    if (targets.length % 2 !== 0) {
      throw Error("Target must have an opening and closing delimiter");
    }

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const thatMark = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const edits = targets.map((target, i) => ({
          editor,
          range: target.contentRange,
          text: i % 2 === 0 ? left : right,
        }));

        const thatRanges = [];
        const thatTargets = [];
        for (let i = 0; i < targets.length; i += 2) {
          thatTargets.push(targets[i]);
          thatRanges.push(
            targets[i].contentRange.union(targets[i + 1].contentRange)
          );
        }

        const [updatedThatRanges] = await performEditsAndUpdateRanges(
          this.graph.rangeUpdater,
          editor,
          edits,
          [thatRanges]
        );

        return createThatMark(thatTargets, updatedThatRanges);
      })
    );

    return { thatMark };
  }
}
