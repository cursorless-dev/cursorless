import { FlashStyle, TextEditor } from "@cursorless/common";
import { flatten, zip } from "lodash-es";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { EditsUpdater } from "../core/updateSelections/updateSelections";
import { RawSelectionTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import { ActionReturnValue, SimpleAction } from "./actions.types";

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
    const editableEditor = ide().getEditableTextEditor(editor);

    const {
      ranges: [updatedEditRanges],
    } = await new EditsUpdater(this.rangeUpdater, editableEditor, edits)
      .ranges(edits.map(({ range }) => range))
      .updateEditorSelections()
      .run();

    return zip(targets, updatedEditRanges).map(
      ([target, range]) =>
        new RawSelectionTarget({
          editor: target!.editor,
          isReversed: target!.isReversed,
          contentRange: range!,
        }),
    );
  }
}
