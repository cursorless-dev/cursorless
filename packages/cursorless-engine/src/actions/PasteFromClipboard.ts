import {
  FlashStyle,
  RangeExpansionBehavior,
  sleep,
  toCharacterRange,
} from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import {
  callFunctionAndUpdateSelections,
  callFunctionAndUpdateSelectionsWithBehavior,
} from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { ensureSingleEditor } from "../util/targetUtils";
import { Actions } from "./Actions";
import { ActionReturnValue } from "./actions.types";

export class PasteFromClipboard {
  constructor(private rangeUpdater: RangeUpdater, private actions: Actions) {}

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));
    const originalEditor = ide().activeEditableTextEditor;

    // First call editNew in order to insert delimiters if necessary and leave
    // the cursor in the right position. Note that this action will focus the
    // editor containing the targets
    const [originalCursorSelections] = await callFunctionAndUpdateSelections(
      this.rangeUpdater,
      async () => {
        await this.actions.editNew.run([targets]);
      },
      editor.document,
      [editor.selections],
    );

    await sleep(100);

    // Then use VSCode paste command, using open ranges at the place where we
    // paste in order to capture the pasted text for highlights and `that` mark
    const [updatedCursorSelections, updatedTargetSelections] =
      await callFunctionAndUpdateSelectionsWithBehavior(
        this.rangeUpdater,
        async () => {
          await editor.clipboardPaste();
          await sleep(100);
        },
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
    setSelectionsWithoutFocusingEditor(editor, updatedCursorSelections);

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
