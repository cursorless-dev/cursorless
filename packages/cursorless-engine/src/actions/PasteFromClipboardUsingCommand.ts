import {
  FlashStyle,
  RangeExpansionBehavior,
  toCharacterRange,
} from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Destination } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";

export class PasteFromClipboardUsingCommand {
  constructor(
    private rangeUpdater: RangeUpdater,
    private actions: Actions,
  ) {
    this.run = this.run.bind(this);
  }

  async run(destinations: Destination[]): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(
      ensureSingleEditor(destinations),
    );
    const originalEditor = ide().activeEditableTextEditor;

    // First call editNew in order to insert delimiters if necessary and leave
    // the cursor in the right position. Note that this action will focus the
    // editor containing the targets
    const callbackEdit = async () => {
      await this.actions.editNew.run(destinations);
    };

    const { cursorSelections: originalCursorSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor,
        preserveCursorSelections: true,
        callback: callbackEdit,
        selections: {
          cursorSelections: editor.selections,
        },
      });

    // Then use VSCode paste command, using open ranges at the place where we
    // paste in order to capture the pasted text for highlights and `that` mark
    const {
      originalCursorSelections: updatedCursorSelections,
      editorSelections: updatedTargetSelections,
    } = await performEditsAndUpdateSelections({
      rangeUpdater: this.rangeUpdater,
      editor,
      callback: () => editor.clipboardPaste(),
      selections: {
        originalCursorSelections,
        editorSelections: {
          selections: editor.selections,
          behavior: RangeExpansionBehavior.openOpen,
        },
      },
    });

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
