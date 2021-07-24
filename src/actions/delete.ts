import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { Selection } from "vscode";
import { computeChangedOffsets } from "../computeChangedOffsets";
import { runOnTargetsForEachEditor } from "../targetUtils";
import displayPendingEditDecorations from "../editDisplayUtils";
import { flatten } from "lodash";

export default class Delete implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "outside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingDelete,
    );

    const thatMark = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, selections) => {
        const newOffsets = computeChangedOffsets(
          editor,
          selections.map((selection) => ({
            range: selection.selection.selection,
            newText: "",
          }))
        );

        await editor.edit((editBuilder) => {
          selections.forEach((selection) => {
            // TODO Properly handle last line of file
            editBuilder.delete(selection.selection.selection);
          });
        });

        return newOffsets.map((offsetRange) => ({
          editor,
          selection: new Selection(
            editor.document.positionAt(offsetRange.startOffset),
            editor.document.positionAt(offsetRange.endOffset)
          ),
        }));
      })
    );

    return { returnValue: null, thatMark };
  }
}
