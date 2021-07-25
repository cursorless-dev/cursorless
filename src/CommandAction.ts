import { commands, window } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
  SelectionWithEditor,
} from "./Types";
import displayPendingEditDecorations from "./editDisplayUtils";
import { runOnTargetsForEachEditor } from "./targetUtils";
import { focusEditor } from "./setSelectionsAndFocusEditor";
import { flatten } from "lodash";
import { callFunctionAndUpdateSelections } from "./updateSelections";

export default class CommandAction implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private command: string) {
    this.run = this.run.bind(this);
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

  async run([targets]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced
    );

    const originalEditor = window.activeTextEditor;

    const thatMark = await this.runCommandAndUpdateSelections(targets);

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== window.activeTextEditor) {
      await focusEditor(originalEditor);
    }

    return { returnValue: null, thatMark };
  }
}
