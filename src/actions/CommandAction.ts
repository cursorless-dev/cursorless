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
import sleep from "../util/sleep";

export interface CommandArguments {
  command?: string;
  commandArgs?: any[];
  restoreSelection?: boolean;
  ensureSingleEditor?: boolean;
  showDecorations?: boolean;
  preCommandSleep?: number;
  postCommandSleep?: number;
  awaitCommand?: boolean;
}

const defaultArguments: CommandArguments = {
  restoreSelection: true,
  commandArgs: [],
  ensureSingleEditor: false,
  showDecorations: false,
  preCommandSleep: 0,
  postCommandSleep: 0,
  awaitCommand: true,
};

export default class CommandAction implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph, private args: CommandArguments = {}) {
    this.run = this.run.bind(this);
  }

  private async runCommandAndUpdateSelections(
    targets: TypedSelection[],
    args: CommandArguments
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

          if (args.preCommandSleep) {
            await sleep(args.preCommandSleep);
          }

          const commandPromise = commands.executeCommand(
            args.command!,
            args.commandArgs
          );

          if (args.awaitCommand) {
            const [updatedOriginalSelections, updatedTargetSelections] =
              await callFunctionAndUpdateSelections(
                this.graph.rangeUpdater,
                () => commandPromise,
                editor.document,
                [originalSelections, targetSelections]
              );

            if (args.postCommandSleep) {
              await sleep(args.postCommandSleep);
            }

            if (args.restoreSelection) {
              editor.selections = updatedOriginalSelections;
            }

            return updatedTargetSelections.map((selection) => ({
              editor,
              selection,
            }));
          }

          if (args.postCommandSleep) {
            await sleep(args.postCommandSleep);
          }

          if (args.restoreSelection) {
            commandPromise.then(() => {
              editor.selections = originalSelections;
            });
          }

          return targetSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );
  }

  async run(
    [targets]: [TypedSelection[]],
    args: CommandArguments = {}
  ): Promise<ActionReturnValue> {
    const actualArgs = Object.assign({}, defaultArguments, this.args, args);

    if (actualArgs.showDecorations) {
      await displayPendingEditDecorations(
        targets,
        this.graph.editStyles.referenced
      );
    }

    if (actualArgs.ensureSingleEditor) {
      ensureSingleEditor(targets);
    }

    const originalEditor = window.activeTextEditor;

    const thatMark = await this.runCommandAndUpdateSelections(
      targets,
      actualArgs
    );

    // If necessary focus back original editor
    if (
      actualArgs.restoreSelection &&
      originalEditor != null &&
      originalEditor !== window.activeTextEditor
    ) {
      await focusEditor(originalEditor);
    }

    return { thatMark };
  }
}
