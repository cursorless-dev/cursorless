import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { runForEachEditor } from "../targetUtils";
import displayPendingEditDecorations from "../editDisplayUtils";
import { computeChangedOffsets } from "../computeChangedOffsets";
import { flatten } from "lodash";

export default class Swap implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets1, targets2]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets1,
      this.graph.editStyles.pendingModification1,
      this.graph.editStyles.pendingLineModification1
    );
    await displayPendingEditDecorations(
      targets2,
      this.graph.editStyles.pendingModification2,
      this.graph.editStyles.pendingLineModification2
    );

    const thatMark = flatten(
      await runForEachEditor(targets, async (editor, selections) => {
        const newOffsets = computeChangedOffsets(
          selections.map((selection) => ({
            startOffset: editor.document.offsetAt(
              selection.selection.selection.start
            ),
            endOffset: editor.document.offsetAt(
              selection.selection.selection.end
            ),
            newTextLength: 0,
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
