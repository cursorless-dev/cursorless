import {
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { flatten, zip } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import {
  performEditsAndUpdateRanges,
  performEditsAndUpdateSelectionsWithBehavior,
} from "../core/updateSelections/updateSelections";
import { RawSelectionTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import {
  createThatMark,
  flashTargets,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
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
    // range: 0:5-0:7, text: "", updateRange: updateRange
    // [what range to remove]
    const edits = targets.map((target) => target.constructRemovalEdit());

    // anchor: 0:4 => active: 0:9
    // [original cursor selection was "world" token]
    const cursorSelections = { selections: editor.selections };
    // anchor: 0:5 => active: 0:7 [what range to remove]
    const editSelections = {
      selections: edits.map(
        ({ range }) => new Selection(range.start, range.end),
      ),
      rangeBehavior: RangeExpansionBehavior.closedClosed,
    };

    const editableEditor = ide().getEditableTextEditor(editor);

    const [
      // anchor: 0:4 => active: 0:7
      // [new cursor selection is "wld"]
      updatedEditorSelections,
      // anchor: 0:5 => active: 0:5 [to be used for the "source" mark for the next command]
      updatedEditSelections,
    ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
      this.rangeUpdater,
      editableEditor,
      edits,
      [cursorSelections, editSelections],
    );

    // range: 0:5-0:5?
    // [the "that" range empty position where text was removed]
    // const deletionRanges = zip(edits, updatedEditSelections).map(
    //   ([edit, selection]) => edit!.updateRange(selection!),
    // );

    // update the selections in the editor
    await setSelectionsWithoutFocusingEditor(
      editableEditor,
      updatedEditorSelections,
    );

    // return createThatMark(targets, updatedEditSelections);
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
