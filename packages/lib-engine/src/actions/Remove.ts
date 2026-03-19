import type { IDE, TextEditor } from "@cursorless/lib-common";
import { FlashStyle } from "@cursorless/lib-common";
import { flatten, zip } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { RawSelectionTarget } from "../processTargets/targets";
import type { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export default class Delete implements SimpleAction {
  constructor(
    private ide: IDE,
    private rangeUpdater: RangeUpdater,
  ) {
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
      await flashTargets(
        this.ide,
        targets,
        FlashStyle.pendingDelete,
        (target) => target.getRemovalHighlightRange(),
      );
    }

    const thatTargets = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor),
    );

    return { thatTargets };
  }

  private async runForEditor(editor: TextEditor, targets: Target[]) {
    const edits = targets.map((target) => target.constructRemovalEdit());
    const editableEditor = this.ide.getEditableTextEditor(editor);

    const { editRanges: updatedEditRanges } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor: editableEditor,
        edits,
        selections: {
          editRanges: edits.map(({ range }) => range),
        },
      });

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
