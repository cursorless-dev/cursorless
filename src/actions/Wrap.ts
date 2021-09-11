import { DecorationRangeBehavior, Selection } from "vscode";
import { flatten } from "lodash";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { decorationSleep } from "../util/editDisplayUtils";
import { performEditsAndUpdateSelections } from "../util/updateSelections";
import { selectionWithEditorFromPositions } from "../util/selectionUtils";

export default class Wrap implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const thatMark = flatten(
      await runOnTargetsForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, targets) => {
          const edits = targets.flatMap((target) => [
            {
              text: left,
              range: new Selection(
                target.selection.selection.start,
                target.selection.selection.start
              ),
            },
            {
              text: right,
              range: new Selection(
                target.selection.selection.end,
                target.selection.selection.end
              ),
            },
          ]);

          const [updatedOriginalSelections, updatedTargetsSelections] =
            await performEditsAndUpdateSelections(
              editor,
              edits,
              [
                editor.selections,
                targets.map((target) => target.selection.selection),
              ],
              DecorationRangeBehavior.ClosedClosed
            );

          editor.selections = updatedOriginalSelections;

          const updatedSelections = updatedTargetsSelections.flatMap(
            ({ start, end }) => [
              new Selection(
                start.translate({ characterDelta: -left.length }),
                start
              ),
              new Selection(
                end,
                end.translate({ characterDelta: right.length })
              ),
            ]
          );

          editor.setDecorations(
            this.graph.editStyles.justAdded.token,
            updatedSelections
          );
          await decorationSleep();

          editor.setDecorations(this.graph.editStyles.justAdded.token, []);

          return targets.map((target, index) => {
            const start = updatedSelections[index * 2].start;
            const end = updatedSelections[index * 2 + 1].end;
            return selectionWithEditorFromPositions(
              target.selection,
              start,
              end
            );
          });
        }
      )
    );

    return { thatMark };
  }
}
