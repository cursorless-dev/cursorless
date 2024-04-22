import { FlashStyle, Selection, TextEditor } from "@cursorless/common";
import { flatten, zip } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { RawSelectionTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import { SimpleAction, ActionReturnValue } from "./actions.types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";

export default class Delete implements SimpleAction {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
    this.runForEditor = this.runForEditor.bind(this);
  }

  async run(
    targets: Target[],
    { showDecorations = true } = {},
  ): Promise<ActionReturnValue> {
    // Unify overlapping targets because of overlapping leading and trailing delimiters.
    targets = unifyRemovalTargets(targets);

    if (showDecorations) {
      await flashTargets(ide(), targets, FlashStyle.pendingDelete, (target) =>
        target.getRemovalHighlightRange(),
      );
    }

    const thatTargets = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor),
    );

    return { thatTargets };
  }

  private async runForEditor(editor: TextEditor, targets: Target[]) {
    const edits = targets.map((target) => target.constructRemovalEdit());

    const cursorSelections = editor.selections;
    const editSelections = edits.map(({ range }) => range.toSelection(false));
    const editableEditor = ide().getEditableTextEditor(editor);

    const [updatedCursorSelections, updatedEditSelections]: Selection[][] =
      await performEditsAndUpdateSelections(
        this.rangeUpdater,
        editableEditor,
        edits,
        [cursorSelections, editSelections],
      );

    await setSelectionsWithoutFocusingEditor(
      editableEditor,
      updatedCursorSelections,
    );

    return zip(targets, updatedEditSelections).map(
      ([target, range]) =>
        new RawSelectionTarget({
          editor: target!.editor,
          isReversed: target!.isReversed,
          contentRange: range!,
        }),
    );
  }
}
