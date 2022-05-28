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
   * Entry point for Cursorless commands. We proceed as follows:
   *
   * 1. Canonicalize the action name and target representation using
   *    {@link canonicalizeAndValidateCommand}, primarily for the purpose of
   *    backwards compatibility
   * 2. Perform inference on targets to fill in details left out using things
   *    like previous targets and action preferences. For example we would
   *    automatically infer that `"take funk air and bat"` is equivalent to
   *    `"take funk air and funk bat"`. See {@link inferFullTargets} for details
   *    of how this is done.
   * 3. Construct a {@link ProcessedTargetsContext} object to capture the
   *    environment needed by {@link processTargets}.
   * 4. Call {@link processTargets} to map each abstract {@link Target} object
   *    to a concrete list of {@link TypedSelection} objects.
   * 5. Run the requested action on the given selections. The mapping from
   *    action id (eg `remove`) to implementation is defined in
   *    {@link Actions}.  To understand how actions work, see some examples,
   *    such as `"take"` {@link SetSelection} and `"chuck"` {@link Delete}. See
   * 6. Update `source` and `that` marks, if they have been returned from the
   *    action, and returns the desired return value indicated by the action, if
   *    it has one.
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

      const selections = processTargets(processedTargetsContext, targets);

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
      if (this.graph.testCaseRecorder.captureErrors()) {
        await this.graph.testCaseRecorder.postCommandHook(e);
      }
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
