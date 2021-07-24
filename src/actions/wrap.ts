import { Selection } from "vscode";
import { flatten } from "lodash";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../Types";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { decorationSleep } from "../editDisplayUtils";
import { performEditsAndUpdateSelections } from "../updateSelections";

export default class Wrap implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

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
          const selections = targets.flatMap((target) => [
            new Selection(
              target.selection.selection.start,
              target.selection.selection.start
            ),
            new Selection(
              target.selection.selection.end,
              target.selection.selection.end
            ),
          ]);

          const edits = selections.map((selection, index) => ({
            range: selection,
            text: index % 2 === 0 ? left : right,
          }));

          const [updatedSelections] = await performEditsAndUpdateSelections(
            editor,
            edits,
            [selections]
          );

          editor.setDecorations(
            this.graph.editStyles.justAdded,
            updatedSelections
          );
          await decorationSleep();
          editor.setDecorations(this.graph.editStyles.justAdded, []);

          return targets.map((target, index) => {
            const start = updatedSelections[index * 2].start;
            const end = updatedSelections[index * 2 + 1].end;
            const isReversed = target.selection.selection.isReversed;
            return {
              editor,
              selection: new Selection(
                isReversed ? end : start,
                isReversed ? start : end
              ),
            };
          });
        }
      )
    );

    return { returnValue: null, thatMark };
  }
}
