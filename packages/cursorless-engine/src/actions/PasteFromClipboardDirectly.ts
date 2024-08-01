import {
  FlashStyle,
  RangeExpansionBehavior,
  toCharacterRange,
  zipStrict,
  type TextEditor,
} from "@cursorless/common";
import { flatten } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Destination } from "../typings/target.types";
import { runForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";
import type { DestinationWithText } from "./PasteFromClipboard";

/**
 * This action pastes the text from the clipboard into the target editor directly
 * by reading the clipboard and inserting the text directly into the editor.
 */
export class PasteFromClipboardDirectly {
  constructor(private rangeUpdater: RangeUpdater) {
    this.runForEditor = this.runForEditor.bind(this);
  }

  async run(destinations: Destination[]): Promise<ActionReturnValue> {
    const text = await ide().clipboard.readText();
    const textLines = text.split(/\r?\n/g);

    // FIXME: We should really use the number of targets from the original copy
    // action, as is done in VSCode.
    const destinationsWithText: DestinationWithText[] =
      destinations.length === textLines.length
        ? zipStrict(destinations, textLines).map(([destination, text]) => ({
            destination,
            text,
          }))
        : destinations.map((destination) => ({ destination, text }));

    const thatSelections = flatten(
      await runForEachEditor(
        destinationsWithText,
        ({ destination }) => destination.editor,
        this.runForEditor,
      ),
    );

    return { thatSelections };
  }

  private async runForEditor(
    editor: TextEditor,
    destinationsWithText: DestinationWithText[],
  ) {
    const edits = destinationsWithText.map(({ destination, text }) =>
      destination.constructChangeEdit(text),
    );

    const { editSelections: updatedEditSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor: ide().getEditableTextEditor(editor),
        edits,
        selections: {
          editSelections: {
            selections: edits.map(({ range }) => range),
            behavior: RangeExpansionBehavior.openOpen,
          },
        },
      });

    const thatTargetSelections = zipStrict(edits, updatedEditSelections).map(
      ([edit, selection]) =>
        edit.updateRange(selection).toSelection(selection.isReversed),
    );

    await ide().flashRanges(
      thatTargetSelections.map((selection) => ({
        editor,
        range: toCharacterRange(selection),
        style: FlashStyle.justAdded,
      })),
    );

    return thatTargetSelections.map((selection) => ({
      editor: editor,
      selection,
    }));
  }
}
