import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsWithoutFocusingEditor";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { SimpleAction, ActionReturnValue } from "./actions.types";

export default class Deselect implements SimpleAction {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      // Remove selections with a non-empty intersection
      const newSelections = editor.selections.filter(
        (selection) =>
          !targets.some((target) => {
            const intersection = target.contentRange.intersection(selection);
            return intersection && (!intersection.isEmpty || selection.isEmpty);
          }),
      );

      if (newSelections.length === 0) {
        throw new SelectionRequiredError();
      }

      await setSelectionsWithoutFocusingEditor(
        ide().getEditableTextEditor(editor),
        newSelections,
      );
    });

    return {
      thatTargets: targets,
    };
  }
}

class SelectionRequiredError extends Error {
  constructor() {
    super("Can't deselect every selection. At least one is required");
    this.name = "SelectionRequiredError";
  }
}
