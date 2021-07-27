import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { runOnTargetsForEachEditor } from "../targetUtils";
import displayPendingEditDecorations from "../editDisplayUtils";
import { flatten } from "lodash";
import { performEditsAndUpdateSelections } from "../updateSelections";

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
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const edits = targets.map((target) => ({
          range: target.selection.selection,
          text: "",
        }));

        const [updatedSelections] = await performEditsAndUpdateSelections(
          editor,
          edits,
          [targets.map((target) => target.selection.selection)]
        );

        return updatedSelections.map((selection) => ({
          editor,
          selection,
        }));
      })
    );

    return { returnValue: null, thatMark };
  }
}
