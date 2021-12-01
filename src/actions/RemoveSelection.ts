import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  TypedSelection,
  Graph,
} from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";

export default class RemoveSelection implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected getSelection(target: TypedSelection) {
    return target.selection.selection;
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      editor.selections = editor.selections.filter(
        (selection) =>
          !targets.find(
            (target) =>
              target.selection.selection.intersection(selection) &&
              !target.selection.selection.start.isEqual(selection.end) &&
              !target.selection.selection.end.isEqual(selection.start)
          )
      );
    });

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}
