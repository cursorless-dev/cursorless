import { commands, DecorationRangeBehavior, window } from "vscode";
import {
  callFunctionAndUpdateSelections,
  callFunctionAndUpdateSelectionsWithBehavior,
} from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import {
  focusEditor,
  setSelectionsWithoutFocusingEditor,
} from "../util/setSelectionsAndFocusEditor";
import { ensureSingleEditor } from "../util/targetUtils";
import { ActionReturnValue } from "./actions.types";

export class Paste {
  constructor(private graph: Graph) {}

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const targetEditor = ensureSingleEditor(targets);
    const originalEditor = window.activeTextEditor;

    // First call editNew in order to insert delimiters if necessary and leave
    // the cursor in the right position.  Note that this action will focus the
    // editor containing the targets
    const [originalCursorSelections] = await callFunctionAndUpdateSelections(
      this.graph.rangeUpdater,
      async () => {
        await this.graph.actions.editNew.run([targets]);
      },
      targetEditor.document,
      [targetEditor.selections],
    );

    // Then use VSCode paste command, using open ranges at the place where we
    // paste in order to capture the pasted text for highlights and `that` mark
    const [updatedCursorSelections, updatedTargetSelections] =
      await callFunctionAndUpdateSelectionsWithBehavior(
        this.graph.rangeUpdater,
        () => commands.executeCommand("editor.action.clipboardPasteAction"),
        targetEditor.document,
        [
          {
            selections: originalCursorSelections,
          },
          {
            selections: targetEditor.selections,
            rangeBehavior: DecorationRangeBehavior.OpenOpen,
          },
        ],
      );

    // Reset cursors on the editor where the edits took place.
    // NB: We don't focus the editor here because we want to focus the original
    // editor, not the one where the edits took place
    setSelectionsWithoutFocusingEditor(targetEditor, updatedCursorSelections);

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== window.activeTextEditor) {
      // NB: We just do one editor focus at the end, instead of using
      // setSelectionsAndFocusEditor because the command might operate on
      // multiple editors, so we just do one focus at the end.
      await focusEditor(originalEditor);
    }

    this.graph.editStyles.displayPendingEditDecorationsForRanges(
      updatedTargetSelections.map((selection) => ({
        editor: targetEditor,
        range: selection,
      })),
      this.graph.editStyles.justAdded,
      true,
    );

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor: targetEditor,
        selection,
      })),
    };
  }
}
