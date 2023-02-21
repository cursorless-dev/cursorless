import { ActionType } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import processTargets from "../../processTargets";
import { Target } from "../../typings/target.types";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../typings/Types";
import { Graph } from "../../typings/Graph";
import { isString } from "../../util/type";
import {
  canonicalizeAndValidateCommand,
  checkForOldInference,
} from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import { PartialTargetV0V1 } from "@cursorless/common";
import inferFullTargets from "../inferFullTargets";
import { ThatMark } from "../ThatMark";
import { Command } from "@cursorless/common";
import { selectionToThatTarget } from "./selectionToThatTarget";

// TODO: Do this using the graph once we migrate its dependencies onto the graph
export class CommandRunner {
  constructor(
    private graph: Graph,
    private thatMark: ThatMark,
    private sourceMark: ThatMark,
  ) {
    this.runCommandBackwardCompatible =
      this.runCommandBackwardCompatible.bind(this);
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
        usePrePhraseSnapshot,
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

      const actionPrePositionStages =
        action.getPrePositionStages != null
          ? action.getPrePositionStages(...actionArgs)
          : [];

      const actionFinalStages =
        action.getFinalStages != null
          ? action.getFinalStages(...actionArgs)
          : [];

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
        getNodeAtLocation: this.graph.getNodeAtLocation,
      };

      if (this.graph.testCaseRecorder.isActive()) {
        const context = {
          targets: targetDescriptors,
          thatMark: this.thatMark,
          sourceMark: this.sourceMark,
          hatTokenMap: readableHatMap,
          spokenForm,
        };
        await this.graph.testCaseRecorder.preCommandHook(
          commandComplete,
          context,
        );
      }

      // NB: We do this once test recording has started so that we can capture
      // warning.
      checkForOldInference(this.graph, partialTargetDescriptors);

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

      if (this.graph.testCaseRecorder.isActive()) {
        await this.graph.testCaseRecorder.postCommandHook(returnValue);
      }

      return returnValue;
    } catch (e) {
      const err = e as Error;
      console.error(err.stack);
      await this.graph.testCaseRecorder.commandErrorHook(err);
      throw e;
    } finally {
      if (this.graph.testCaseRecorder.isActive()) {
        this.graph.testCaseRecorder.finallyHook();
      }
    }
  }

  runCommandBackwardCompatible(
    spokenFormOrCommand: string | Command,
    ...rest: unknown[]
  ) {
    let command: Command;

    if (isString(spokenFormOrCommand)) {
      const spokenForm = spokenFormOrCommand;
      const [action, targets, ...extraArgs] = rest as [
        ActionType,
        PartialTargetV0V1[],
        ...unknown[],
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
