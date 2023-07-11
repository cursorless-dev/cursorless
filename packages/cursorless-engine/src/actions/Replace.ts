import { FlashStyle, ReplaceWith } from "@cursorless/common";
import { flatten, zip } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Destination } from "../typings/target.types";
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
      edit: destination!.constructChangeEdit(text!),
      editor: destination!.editor,
    }));

    const thatMark = flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          const [updatedSelections] = await performEditsAndUpdateSelections(
            this.rangeUpdater,
            ide().getEditableTextEditor(editor),
            edits.map(({ edit }) => edit),
            [destinations.map((destination) => destination.contentSelection)],
          );

          return updatedSelections.map((selection) => ({
            editor,
            selection,
          }));
        },
      ),
    );

    return { thatSelections: thatMark };
  }
}
