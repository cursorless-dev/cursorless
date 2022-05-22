import { flatten, zip } from "lodash";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import RawSelectionTarget from "../processTargets/targets/RawSelectionTarget";
import { Target } from "../typings/target.types";
import { ActionPreferences, Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { runForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Rewrap implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    {
      modifiers: [
        {
          type: "surroundingPair",
          delimiter: "any",
        },
      ],
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
    const targetInfos = targets.flatMap((target) => {
      const boundary = target.boundary;

      if (boundary == null || boundary.length !== 2) {
        throw Error("Target must have an opening and closing delimiter");
      }

      return {
        editor: target.editor,
        boundary: boundary.map(
          (edge) =>
            new RawSelectionTarget({
              editor: target.editor,
              contentRange: edge,
              isReversed: target.isReversed,
            })
        ),
        targetSelection: target.getContentSelection(),
      };
    });

    await displayPendingEditDecorations(
      targetInfos.flatMap(({ boundary }) => boundary),
      this.graph.editStyles.pendingModification0
    );

    const thatMark = flatten(
      await runForEachEditor(
        targetInfos,
        (targetInfo) => targetInfo.editor,
        async (editor, targetInfos) => {
          const edits = targetInfos.flatMap((targetInfo) =>
            zip(targetInfo.boundary, [left, right]).map(([target, text]) => ({
              editor,
              range: target!.contentRange,
              text: text!,
            }))
          );

          const [updatedTargetSelections] =
            await performEditsAndUpdateSelections(
              this.graph.rangeUpdater,
              editor,
              edits,
              [targetInfos.map((targetInfo) => targetInfo.targetSelection)]
            );

          return updatedTargetSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );

    return { thatMark };
  }
}
