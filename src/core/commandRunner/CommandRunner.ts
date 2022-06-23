import * as vscode from "vscode";
import { ActionType } from "../../actions/actions.types";
import { OutdatedExtensionError } from "../../errors";
import processTargets from "../../processTargets";
import isTesting from "../../testUtil/isTesting";
import { Graph, ProcessedTargetsContext } from "../../typings/Types";
import { isString } from "../../util/type";
import { canonicalizeAndValidateCommand } from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import { PartialTargetV0V1 } from "../commandVersionUpgrades/upgradeV1ToV2/commandV1.types";
import inferFullTargets from "../inferFullTargets";
import { ThatMark } from "../ThatMark";
import { Command } from "./command.types";

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
   *    like previous targets. For example we would
   *    automatically infer that `"take funk air and bat"` is equivalent to
   *    `"take funk air and funk bat"`. See {@link inferFullTargets} for details
   *    of how this is done.
   * 3. Construct a {@link ProcessedTargetsContext} object to capture the
   *    environment needed by {@link processTargets}.
   * 4. Call {@link processTargets} to map each abstract {@link Target} object
   *    to a concrete list of {@link Target} objects.
   * 5. Run the requested action on the given selections. The mapping from
   *    action id (eg `remove`) to implementation is defined in
   *    {@link Actions}.  To understand how actions work, see some examples,
   *    such as `"take"` {@link SetSelection} and `"chuck"` {@link Delete}. See
   * 6. Update `source` and `that` marks, if they have been returned from the
   *    action, and returns the desired return value indicated by the action, if
   *    it has one.
   */
  async runCommand(command: Command) {
    try {
      if (this.graph.debug.active) {
        this.graph.debug.log(`command:`);
        this.graph.debug.log(JSON.stringify(command, null, 3));
      }

      const commandComplete = canonicalizeAndValidateCommand(command);
      const {
        spokenForm,
        action: { name: actionName, args: actionArgs },
        targets: partialTargetDescriptors,
        usePrePhraseSnapshot,
      } = commandComplete;

      const readableHatMap = await this.graph.hatTokenMap.getReadableMap(
        usePrePhraseSnapshot
      );

      const action = this.graph.actions[actionName];

      if (action == null) {
        throw new Error(`Unknown action ${actionName}`);
      }

      const targetDescriptors = inferFullTargets(partialTargetDescriptors);

      if (this.graph.debug.active) {
        this.graph.debug.log("Full targets:");
        this.graph.debug.log(JSON.stringify(targetDescriptors, null, 3));
      }

      const actionStages =
        action.getFinalStages != null
          ? action.getFinalStages(...actionArgs)
          : [];

      const processedTargetsContext: ProcessedTargetsContext = {
        actionStages,
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
        this.graph.editStyles.testDecorations = [];
        const context = {
          targets: targetDescriptors,
          thatMark: this.thatMark,
          sourceMark: this.sourceMark,
          hatTokenMap: readableHatMap,
          spokenForm,
          decorations: this.graph.editStyles.testDecorations,
        };
        await this.graph.testCaseRecorder.preCommandHook(
          commandComplete,
          context
        );
      }

      const targets = processTargets(
        processedTargetsContext,
        targetDescriptors
      );

      const {
        returnValue,
        thatMark: newThatMark,
        sourceMark: newSourceMark,
      } = await action.run(targets, ...actionArgs);

      this.thatMark.set(newThatMark);
      this.sourceMark.set(newSourceMark);

      if (this.graph.testCaseRecorder.isActive()) {
        await this.graph.testCaseRecorder.postCommandHook(returnValue);
      }

      return returnValue;
    } catch (e) {
      await this.graph.testCaseRecorder.commandErrorHook(e as Error);
      const err = e as Error;
      if (err instanceof OutdatedExtensionError) {
        this.showUpdateExtensionErrorMessage(err);
      } else if (!isTesting()) {
        vscode.window.showErrorMessage(err.message);
      }
      console.error(err.message);
      console.error(err.stack);
      throw err;
    }
  }

  async showUpdateExtensionErrorMessage(err: OutdatedExtensionError) {
    const item = await vscode.window.showErrorMessage(
      err.message,
      "Check for updates"
    );

    if (item == null) {
      return;
    }

    await vscode.commands.executeCommand(
      "workbench.extensions.action.checkForUpdates"
    );
  }

  private runCommandBackwardCompatible(
    spokenFormOrCommand: string | Command,
    ...rest: unknown[]
  ) {
    let command: Command;

    if (isString(spokenFormOrCommand)) {
      const spokenForm = spokenFormOrCommand;
      const [action, targets, ...extraArgs] = rest as [
        ActionType,
        PartialTargetV0V1[],
        ...unknown[]
      ];

      command = {
        version: 0,
        spokenForm,
        action,
        targets,
        extraArgs,
        usePrePhraseSnapshot: false,
      };
    } else {
      command = spokenFormOrCommand;
    }

    return this.runCommand(command);
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
