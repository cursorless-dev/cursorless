import type { ReplaceWith } from "@cursorless/common";
import { FlashStyle, RangeExpansionBehavior } from "@cursorless/common";
import { zip } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { SelectionWithEditor } from "../typings/Types";
import type { Destination, Target } from "../typings/target.types";
import { flashTargets, runForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class Replace {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  private getTexts(
    destinations: Destination[],
    replaceWith: ReplaceWith,
  ): string[] {
    if (Array.isArray(replaceWith)) {
      // Broadcast single text to each target
      if (replaceWith.length === 1) {
        return Array(destinations.length).fill(replaceWith[0]);
      }
      return replaceWith;
    }
    const numbers = [];
    for (let i = 0; i < destinations.length; ++i) {
      numbers[i] = (replaceWith.start + i).toString();
    }
    return numbers;
  }

  async run(
    destinations: Destination[],
    replaceWith: ReplaceWith,
  ): Promise<ActionReturnValue> {
    await flashTargets(
      ide(),
      destinations.map((d) => d.target),
      FlashStyle.pendingModification0,
    );

    const texts = this.getTexts(destinations, replaceWith);

    if (destinations.length !== texts.length) {
      throw new Error("Targets and texts must have same length");
    }

    const edits = zip(destinations, texts).map(([destination, text]) => ({
      editor: destination!.editor,
      target: destination!.target,
      edit: destination!.constructChangeEdit(text!),
    }));

    const sourceTargets: Target[] = [];
    const thatSelections: SelectionWithEditor[] = [];

    await runForEachEditor(
      edits,
      (edit) => edit.editor,
      async (editor, editWrappers) => {
        const edits = editWrappers.map(({ edit }) => edit);

        const {
          contentSelections: updatedContentSelections,
          editRanges: updatedEditRanges,
        } = await performEditsAndUpdateSelections({
          rangeUpdater: this.rangeUpdater,
          editor: ide().getEditableTextEditor(editor),
          edits,
          selections: {
            contentSelections: editWrappers.map(
              ({ target }) => target.contentSelection,
            ),
            editRanges: {
              selections: edits.map(({ range }) => range),
              behavior: RangeExpansionBehavior.openOpen,
            },
          },
        });

        for (const [wrapper, selection] of zip(
          editWrappers,
          updatedContentSelections,
        )) {
          sourceTargets.push(wrapper!.target.withContentRange(selection!));
        }

        for (const [wrapper, range] of zip(editWrappers, updatedEditRanges)) {
          thatSelections.push({
            editor,
            selection: wrapper!.edit.updateRange(range!).toSelection(false),
          });
        }
      },
    );

    return { sourceTargets, thatSelections };
  }
}
