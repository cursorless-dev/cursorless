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
import {
  focusEditor,
  setSelectionsAndFocusEditor,
} from "../util/setSelectionsAndFocusEditor";
import { flatten } from "lodash";

import { ensureSingleEditor } from "../util/targetUtils";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";

export default class CommandAction implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];
  private command: string;
  private ensureSingleEditor: boolean;

  constructor(
    private graph: Graph,
    { command = "", ensureSingleEditor = false } = {}
  ) {
    this.run = this.run.bind(this);
    this.command = command;
    this.ensureSingleEditor = ensureSingleEditor;
  }

  private async runCommandAndUpdateSelections(
    targets: TypedSelection[],
    command: string
  ) {
    return flatten(
      await runOnTargetsForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, targets) => {
          const originalSelections = editor.selections;

          const targetSelections = targets.map(
            (target) => target.selection.selection
          );

          // For command to the work we have to have the correct editor focused
          await setSelectionsAndFocusEditor(editor, targetSelections, false);

          const [updatedOriginalSelections, updatedTargetSelections] =
            await callFunctionAndUpdateSelections(
              this.graph.rangeUpdater,
              () => commands.executeCommand(command),
              editor.document,
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
    { command = "", showDecorations = true } = {}
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

    const thatMark = await this.runCommandAndUpdateSelections(
      targets,
      command || this.command
    );

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== window.activeTextEditor) {
      await focusEditor(originalEditor);
    }

    return { thatMark };
  }
}
