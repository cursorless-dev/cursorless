import { Selection } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  TypedSelection,
  Graph,
} from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";

export default class Deselect implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      // Remove selections with a non-empty intersection
      const newSelections = editor.selections.filter(
        (selection) =>
          !targets.some((target) => {
            const intersection =
              target.selection.selection.intersection(selection);
            return intersection && (!intersection.isEmpty || selection.isEmpty);
          })
      );
      // The editor requires at least one selection. Keep "primary" selection active
      editor.selections = newSelections.length
        ? newSelections
        : [new Selection(editor.selection.active, editor.selection.active)];
    });

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}
