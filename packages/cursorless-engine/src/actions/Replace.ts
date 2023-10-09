import {
  FlashStyle,
  RangeExpansionBehavior,
  ReplaceWith,
} from "@cursorless/common";
import { zip } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelectionsWithBehavior } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { SelectionWithEditor } from "../typings/Types";
import { Destination, Target } from "../typings/target.types";
import { flashTargets, runForEachEditor } from "../util/targetUtils";
import { ActionReturnValue } from "./actions.types";

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
      async (editor, edits) => {
        const contentSelections = {
          selections: edits.map(({ target }) => target.contentSelection),
        };
        const editSelections = {
          selections: edits.map(({ edit }) => edit.range.toSelection(false)),
          rangeBehavior: RangeExpansionBehavior.openOpen,
        };

        const [updatedContentSelections, updatedEditSelections] =
          await performEditsAndUpdateSelectionsWithBehavior(
            this.rangeUpdater,
            ide().getEditableTextEditor(editor),
            edits.map(({ edit }) => edit),
            [contentSelections, editSelections],
          );

        for (const [edit, selection] of zip(edits, updatedContentSelections)) {
          sourceTargets.push(edit!.target.withContentRange(selection!));
        }

        for (const [edit, selection] of zip(edits, updatedEditSelections)) {
          thatSelections.push({
            editor,
            selection: edit!.edit
              .updateRange(selection!)
              .toSelection(selection!.isReversed),
          });
        }
      },
    );

    return { sourceTargets, thatSelections };
  }
}
