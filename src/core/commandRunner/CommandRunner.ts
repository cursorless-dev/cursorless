import * as vscode from "vscode";
import inferFullTargets from "../inferFullTargets";
import processTargets from "../../processTargets";
import {
  ActionType,
  Graph,
  PartialTarget,
  ProcessedTargetsContext,
} from "../../typings/Types";
import { ThatMark } from "../ThatMark";
import { canonicalizeAndValidateCommand } from "../../util/canonicalizeAndValidateCommand";
import { CommandArgument } from "./types";
import { isString } from "../../util/type";
import { ActionableError } from "../../errors";

// TODO: Do this using the graph once we migrate its dependencies onto the graph
export default class CommandRunner {
  private disposables: vscode.Disposable[] = [];

  constructor(
    private graph: Graph,
    private thatMark: ThatMark,
    private sourceMark: ThatMark
  ) {
    graph.extensionContext.subscriptions.push(this);

    this.runCommandBackwardCompatible =
      this.runCommandBackwardCompatible.bind(this);

    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.command",
        this.runCommandBackwardCompatible
      )
    );
  }

  /**
   * Entry point for each command.
   * 
   * * Makes action name and targets canonical, see {@link canonicalizeAndValidateCommand}. 
   * * Infers targets based on previous targets and action preferences, see {@link inferFullTargets}.
   * * Captures special targets (current selection, source, that) in {@link ProcessedTargetsContext}.
   * * Maps abstract {@link Target}, example `arg air`
   *   to concrete {@link TypedSelection[]} example `line 3, charachter 5 to 10`, 
   *   see {@link processTargets}.
   * * Runs action given the selections. Sample actions `take` {@link SetSelection}
   *   and `chuck` {@link Delete}. See {@link Actions} for all actions. 
   * * Updates source and that marks if returned from running the action (it often will change them)
   *   and returns a return value if any.
   */
  async runCommand(commandArgument: CommandArgument) {
    try {
      if (this.graph.debug.active) {
        this.graph.debug.log(`commandArgument:`);
        this.graph.debug.log(JSON.stringify(commandArgument, null, 3));
      }

      const {
        spokenForm,
        action: actionName,
        targets: partialTargets,
        extraArgs,
        usePrePhraseSnapshot,
      } = canonicalizeAndValidateCommand(commandArgument);

      const readableHatMap = await this.graph.hatTokenMap.getReadableMap(
        usePrePhraseSnapshot
      );

      const action = this.graph.actions[actionName];

      if (action == null) {
        throw new Error(`Unknown action ${actionName}`);
      }

      const targets = inferFullTargets(
        partialTargets,
        action.getTargetPreferences(...extraArgs)
      );

      if (this.graph.debug.active) {
        this.graph.debug.log("Full targets:");
        this.graph.debug.log(JSON.stringify(targets, null, 3));
      }

      const processedTargetsContext: ProcessedTargetsContext = {
        currentSelections:
          vscode.window.activeTextEditor?.selections.map((selection) => ({
            selection,
            editor: vscode.window.activeTextEditor!,
          })) ?? [],
        currentEditor: vscode.window.activeTextEditor,
        hatTokenMap: readableHatMap,
        thatMark: this.thatMark.exists() ? this.thatMark.get() : [],
        sourceMark: this.sourceMark.exists() ? this.sourceMark.get() : [],
        getNodeAtLocation: this.graph.getNodeAtLocation,
      };

      const selections = processTargets(processedTargetsContext, targets);

      if (this.graph.testCaseRecorder.isActive()) {
        const context = {
          targets,
          thatMark: this.thatMark,
          sourceMark: this.sourceMark,
          hatTokenMap: readableHatMap,
          spokenForm,
        };
        await this.graph.testCaseRecorder.preCommandHook(
          commandArgument,
          context
        );
      }

      const {
        returnValue,
        thatMark: newThatMark,
        sourceMark: newSourceMark,
      } = await action.run(selections, ...extraArgs);

      this.thatMark.set(newThatMark);
      this.sourceMark.set(newSourceMark);

      if (this.graph.testCaseRecorder.isActive()) {
        await this.graph.testCaseRecorder.postCommandHook(returnValue);
      }

      return returnValue;
    } catch (e) {
      this.graph.testCaseRecorder.commandErrorHook();
      const err = e as Error;
      if ((err as Error).name === "ActionableError") {
        (err as ActionableError).showErrorMessage();
      } else {
        vscode.window.showErrorMessage(err.message);
      }
      console.error(err.message);
      console.error(err.stack);
      throw err;
    }
  }

  private runCommandBackwardCompatible(
    spokenFormOrCommandArgument: string | CommandArgument,
    ...rest: unknown[]
  ) {
    let commandArgument: CommandArgument;

    if (isString(spokenFormOrCommandArgument)) {
      const spokenForm = spokenFormOrCommandArgument;
      const [action, targets, ...extraArgs] = rest as [
        ActionType,
        PartialTarget[],
        ...unknown[]
      ];

      commandArgument = {
        version: 0,
        spokenForm,
        action,
        targets,
        extraArgs,
        usePrePhraseSnapshot: false,
      };
    } else {
      commandArgument = spokenFormOrCommandArgument;
    }

    return this.runCommand(commandArgument);
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
