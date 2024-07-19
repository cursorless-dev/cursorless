import {
  FlashStyle,
  RangeExpansionBehavior,
  toCharacterRange,
  zipStrict,
  type Selection,
  type TextEditor,
} from "@cursorless/common";
import flatten from "lodash-es/flatten";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import {
  callFunctionAndUpdateSelections,
  callFunctionAndUpdateSelectionsWithBehavior,
  performEditsAndUpdateSelectionsWithBehavior,
} from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Destination } from "../typings/target.types";
import { ensureSingleEditor, runForEachEditor } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";

interface DestinationWithText {
  destination: Destination;
  text: string;
}

export class PasteFromClipboard {
  constructor(
    private rangeUpdater: RangeUpdater,
    private actions: Actions,
  ) {
    this.run = this.run.bind(this);
    this.runForEditor = this.runForEditor.bind(this);
  }

  async run(destinations: Destination[]): Promise<ActionReturnValue> {
    if (ide().capabilities.commands.clipboardPaste != null) {
      return this.runBySettingSelection(destinations);
    }

    return this.runByEdit(destinations);
  }

  private async runByEdit(
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
    const text = await ide().clipboard.readText();
    const textLines = text.split(/\r?\n/g);

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

    // const cursorSelections = editor.selections;
    // const editSelections = edits.map(({ range }) => range.toSelection(false));
    const cursorSelections = {
      selections: editor.selections,
    };
    const editSelections = {
      selections: edits.map(({ range }) => range.toSelection(false)),
      rangeBehavior: RangeExpansionBehavior.openOpen,
    };
    const editableEditor = ide().getEditableTextEditor(editor);

    const [updatedCursorSelections, updatedEditSelections]: Selection[][] =
      await performEditsAndUpdateSelectionsWithBehavior(
        this.rangeUpdater,
        editableEditor,
        edits,
        [cursorSelections, editSelections],
      );

    await editableEditor.setSelections(updatedCursorSelections);

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

  private async runBySettingSelection(
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(
      ensureSingleEditor(destinations),
    );
    const originalEditor = ide().activeEditableTextEditor;

    // First call editNew in order to insert delimiters if necessary and leave
    // the cursor in the right position. Note that this action will focus the
    // editor containing the targets
    const [originalCursorSelections] = await callFunctionAndUpdateSelections(
      this.rangeUpdater,
      async () => {
        await this.actions.editNew.run(destinations);
      },
      editor.document,
      [editor.selections],
    );

    // Then use VSCode paste command, using open ranges at the place where we
    // paste in order to capture the pasted text for highlights and `that` mark
    const [updatedCursorSelections, updatedTargetSelections] =
      await callFunctionAndUpdateSelectionsWithBehavior(
        this.rangeUpdater,
        () => editor.clipboardPaste(),
        editor.document,
        [
          {
            selections: originalCursorSelections,
          },
          {
            selections: editor.selections,
            rangeBehavior: RangeExpansionBehavior.openOpen,
          },
        ],
      );

    // Reset cursors on the editor where the edits took place.
    // NB: We don't focus the editor here because we want to focus the original
    // editor, not the one where the edits took place
    await editor.setSelections(updatedCursorSelections);

    // If necessary focus back original editor
    if (originalEditor != null && !originalEditor.isActive) {
      // NB: We just do one editor focus at the end, instead of using
      // setSelectionsAndFocusEditor because the command might operate on
      // multiple editors, so we just do one focus at the end.
      await originalEditor.focus();
    }

    await ide().flashRanges(
      updatedTargetSelections.map((selection) => ({
        editor,
        range: toCharacterRange(selection),
        style: FlashStyle.justAdded,
      })),
    );

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor: editor,
        selection,
      })),
    };
  }
}
