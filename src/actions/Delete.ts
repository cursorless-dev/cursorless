import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { flatten } from "lodash";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";

export default class Delete implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "outside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    { showDecorations = true } = {}
  ): Promise<ActionReturnValue> {
    if (showDecorations) {
      await displayPendingEditDecorations(
        targets,
        this.graph.editStyles.pendingDelete
      );
    }

    const thatMark = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const edits = targets.map((target) => ({
          range: target.selection.selection,
          text: "",
        }));

        const [updatedSelections] = await performEditsAndUpdateSelections(
          this.graph.rangeUpdater,
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

    return { thatMark };
  }
}
