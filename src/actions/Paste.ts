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
import { EditNew } from "./EditNew";

export class Paste {
  private editNewAction: EditNew;

  constructor(private graph: Graph) {
    this.editNewAction = new EditNew(graph);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const targetEditor = ensureSingleEditor(targets);
    const originalEditor = window.activeTextEditor;

    const [originalCursorSelections] = await callFunctionAndUpdateSelections(
      this.graph.rangeUpdater,
      async () => {
        await this.editNewAction.run([targets]);
      },
      targetEditor.document,
      [targetEditor.selections]
    );

    const originalTargetSelections = {
      selections: targetEditor.selections,
      rangeBehavior: DecorationRangeBehavior.OpenOpen,
    };

    const [updatedCursorSelections, updatedTargetSelections] =
      await callFunctionAndUpdateSelectionsWithBehavior(
        this.graph.rangeUpdater,
        () => commands.executeCommand("editor.action.clipboardPasteAction"),
        targetEditor.document,
        [
          {
            selections: originalCursorSelections,
          },
          originalTargetSelections,
        ]
      );

    // Reset original selections
    // NB: We don't focus the editor here because we'll do that at the
    // very end.
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
      true
    );

    return {
      thatMark: updatedTargetSelections.map((selection) => ({
        editor: targetEditor,
        selection,
      })),
    };
  }
}
