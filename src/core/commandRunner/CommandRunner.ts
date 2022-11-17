import * as vscode from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { ActionRecord } from "../../actions/actions.types";
import { OutdatedExtensionError } from "../../errors";
import { IDE } from "../../libs/common/ide/types/ide.types";
import ide from "../../libs/cursorless-engine/singletons/ide.singleton";
import processTargets from "../../processTargets";
import isTesting from "../../testUtil/isTesting";
import { TestCaseRecorder } from "../../testUtil/TestCaseRecorder";
import { Target } from "../../typings/target.types";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../typings/Types";
import {
  canonicalizeAndValidateCommand,
  checkForOldInference,
} from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import Debug from "../Debug";
import { EditStyles } from "../editStyles";
import HatTokenMap from "../HatTokenMap";
import inferFullTargets from "../inferFullTargets";
import { ThatMark } from "../ThatMark";
import migrateV0Command from "./migrateV0Command";
import { selectionToThatTarget } from "./selectionToThatTarget";

export default class CommandRunner {
  constructor(
    private ide: IDE,
    private debug: Debug,
    private hatTokenMap: HatTokenMap,
    private actions: ActionRecord,
    private getNodeAtLocation: (location: vscode.Location) => SyntaxNode,
    private editStyles: EditStyles,
    private testCaseRecorder: TestCaseRecorder,
    private thatMark: ThatMark,
    private sourceMark: ThatMark,
  ) {}

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
  async runCommand(args: unknown[]) {
    try {
      const command = migrateV0Command(args);

      if (this.debug.active) {
        this.debug.log(`command:`);
        this.debug.log(JSON.stringify(command, null, 3));
      }

      const commandComplete = canonicalizeAndValidateCommand(command);
      const {
        spokenForm,
        action: { name: actionName, args: actionArgs },
        targets: partialTargetDescriptors,
        usePrePhraseSnapshot,
      } = commandComplete;

      const readableHatMap = await this.hatTokenMap.getReadableMap(
        usePrePhraseSnapshot,
      );

      const action = this.actions[actionName];

      if (action == null) {
        throw new Error(`Unknown action ${actionName}`);
      }

      const targetDescriptors = inferFullTargets(partialTargetDescriptors);

      if (this.debug.active) {
        this.debug.log("Full targets:");
        this.debug.log(JSON.stringify(targetDescriptors, null, 3));
      }

      const actionPrePositionStages =
        action.getPrePositionStages?.(...actionArgs) ?? [];

      const actionFinalStages = action.getFinalStages?.(...actionArgs) ?? [];

      const processedTargetsContext: ProcessedTargetsContext = {
        actionPrePositionStages,
        actionFinalStages,
        currentSelections:
          ide().activeTextEditor?.selections.map((selection) => ({
            selection,
            editor: ide().activeTextEditor!,
          })) ?? [],
        currentEditor: ide().activeTextEditor,
        hatTokenMap: readableHatMap,
        thatMark: this.thatMark.exists() ? this.thatMark.get() : [],
        sourceMark: this.sourceMark.exists() ? this.sourceMark.get() : [],
        getNodeAtLocation: this.getNodeAtLocation,
      };

      if (this.testCaseRecorder.isActive()) {
        this.editStyles.testDecorations = [];
        const context = {
          targets: targetDescriptors,
          thatMark: this.thatMark,
          sourceMark: this.sourceMark,
          hatTokenMap: readableHatMap,
          spokenForm,
          decorations: this.editStyles.testDecorations,
        };
        await this.testCaseRecorder.preCommandHook(commandComplete, context);
      }

      // NB: We do this once test recording has started so that we can capture
      // warning.
      checkForOldInference(this.ide, partialTargetDescriptors);

      const targets = processTargets(
        processedTargetsContext,
        targetDescriptors,
      );

      const {
        returnValue,
        thatSelections: newThatSelections,
        thatTargets: newThatTargets,
        sourceSelections: newSourceSelections,
        sourceTargets: newSourceTargets,
      } = await action.run(targets, ...actionArgs);

      this.thatMark.set(constructThatTarget(newThatTargets, newThatSelections));
      this.sourceMark.set(
        constructThatTarget(newSourceTargets, newSourceSelections),
      );

      if (this.testCaseRecorder.isActive()) {
        await this.testCaseRecorder.postCommandHook(returnValue);
      }

      return returnValue;
    } catch (e) {
      await this.testCaseRecorder.commandErrorHook(e as Error);
      const err = e as Error;
      if (err instanceof OutdatedExtensionError) {
        this.showUpdateExtensionErrorMessage(err);
      } else if (!isTesting()) {
        vscode.window.showErrorMessage(err.message);
      }
      console.error(err.message);
      console.error(err.stack);
      throw err;
    } finally {
      if (this.testCaseRecorder.isActive()) {
        this.testCaseRecorder.finallyHook();
      }
    }
  }

  private async showUpdateExtensionErrorMessage(err: OutdatedExtensionError) {
    const item = await vscode.window.showErrorMessage(
      err.message,
      "Check for updates",
    );

    if (item == null) {
      return;
    }

    await vscode.commands.executeCommand(
      "workbench.extensions.action.checkForUpdates",
    );
  }
}

function constructThatTarget(
  targets: Target[] | undefined,
  selections: SelectionWithEditor[] | undefined,
) {
  if (targets != null && selections != null) {
    throw Error(
      "Actions may only return full targets or selections for that mark",
    );
  }

  if (selections != null) {
    return selections.map(selectionToThatTarget);
  } else {
    return targets;
  }
}
