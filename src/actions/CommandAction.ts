import { commands, window } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
  SelectionWithEditor,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { focusEditor } from "../util/setSelectionsAndFocusEditor";
import { flatten } from "lodash";
import { callFunctionAndUpdateSelections } from "../util/updateSelections";
import { ensureSingleEditor } from "../util/targetUtils";

export default class CommandAction implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];
  private ensureSingleEditor: boolean;

  constructor(
    private graph: Graph,
    private command: string,
    { ensureSingleEditor = false } = {}
  ) {
    this.run = this.run.bind(this);
    this.ensureSingleEditor = ensureSingleEditor;
  }

  private async runCommandAndUpdateSelections(targets: TypedSelection[]) {
    return flatten(
      await runOnTargetsForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, targets) => {
          // For command to the work we have to have the correct editor focused
          if (editor !== window.activeTextEditor) {
            await focusEditor(editor);
          }

          const originalSelections = editor.selections;

          const targetSelections = targets.map(
            (target) => target.selection.selection
          );

          editor.selections = targetSelections;

          const [updatedOriginalSelections, updatedTargetSelections] =
            await callFunctionAndUpdateSelections(
              () => commands.executeCommand(this.command),
              editor,
              [originalSelections, targetSelections]
            );

          // Reset original selections
          editor.selections = updatedOriginalSelections;

          return updatedTargetSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );
  }

  async run(
    [targets]: [TypedSelection[]],
    { showDecorations = true } = {}
  ): Promise<ActionReturnValue> {
    if (showDecorations) {
      await displayPendingEditDecorations(
        targets,
        this.graph.editStyles.referenced
      );
    }

    if (this.ensureSingleEditor) {
      ensureSingleEditor(targets);
    }

    const originalEditor = window.activeTextEditor;

    const thatMark = await this.runCommandAndUpdateSelections(targets);

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== window.activeTextEditor) {
      await focusEditor(originalEditor);
    }

    return { thatMark };
  }
}
