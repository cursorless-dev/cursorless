import { flatten } from "lodash";
import { commands, window } from "vscode";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import {
  focusEditor,
  setSelectionsAndFocusEditor,
  setSelectionsWithoutFocusingEditor,
} from "../util/setSelectionsAndFocusEditor";
import {
  ensureSingleEditor,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export interface CommandOptions {
  command?: string;
  commandArgs?: any[];
  restoreSelection?: boolean;
  ensureSingleEditor?: boolean;
  showDecorations?: boolean;
}

const defaultOptions: CommandOptions = {
  commandArgs: [],
  restoreSelection: true,
  ensureSingleEditor: false,
  showDecorations: false,
};

export default class CommandAction implements Action {
  constructor(private graph: Graph, private options: CommandOptions = {}) {
    this.run = this.run.bind(this);
  }

  private async runCommandAndUpdateSelections(
    targets: Target[],
    options: Required<CommandOptions>
  ) {
    return flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const originalSelections = editor.selections;

        const targetSelections = targets.map(
          (target) => target.contentSelection
        );

        // For command to the work we have to have the correct editor focused
        await setSelectionsAndFocusEditor(editor, targetSelections, false);

        const [updatedOriginalSelections, updatedTargetSelections] =
          await callFunctionAndUpdateSelections(
            this.graph.rangeUpdater,
            () =>
              commands.executeCommand(options.command, ...options.commandArgs),
            editor.document,
            [originalSelections, targetSelections]
          );

        // Reset original selections
        if (options.restoreSelection) {
          // NB: We don't focus the editor here because we'll do that at the
          // very end.  This code can run on multiple editors in the course of
          // one command, so we want to avoid focusing the editor multiple
          // times.
          setSelectionsWithoutFocusingEditor(editor, updatedOriginalSelections);
        }

        return updatedTargetSelections.map((selection) => ({
          editor,
          selection,
        }));
      })
    );
  }

  async run(
    [targets]: [Target[]],
    options: CommandOptions = {}
  ): Promise<ActionReturnValue> {
    const partialOptions = Object.assign(
      {},
      defaultOptions,
      this.options,
      options
    );

    if (partialOptions.command == null) {
      throw Error("Command id must be specified");
    }

    const actualOptions = partialOptions as Required<CommandOptions>;

    if (actualOptions.showDecorations) {
      await this.graph.editStyles.displayPendingEditDecorations(
        targets,
        this.graph.editStyles.referenced
      );
    }

    if (actualOptions.ensureSingleEditor) {
      ensureSingleEditor(targets);
    }

    const originalEditor = window.activeTextEditor;

    const thatMark = await this.runCommandAndUpdateSelections(
      targets,
      actualOptions
    );

    // If necessary focus back original editor
    if (
      actualOptions.restoreSelection &&
      originalEditor != null &&
      originalEditor !== window.activeTextEditor
    ) {
      // NB: We just do one editor focus at the end, instead of using
      // setSelectionsAndFocusEditor because the command might operate on
      // multiple editors, so we just do one focus at the end.
      await focusEditor(originalEditor);
    }

    return { thatMark };
  }
}
