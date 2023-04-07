import {
  ActionType,
  Command,
  HatTokenMap,
  isTesting,
  PartialTargetV0V1,
} from "@cursorless/common";
import { ActionRecord } from "../../actions/actions.types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { Actions } from "../../actions/Actions";
import { TestCaseRecorder } from "../../index";
import { TargetPipeline } from "../../processTargets";
import { MarkStageFactory } from "../../processTargets/MarkStageFactory";
import { ModifierStageFactory } from "../../processTargets/ModifierStageFactory";
import { ide } from "../../singletons/ide.singleton";
import { TreeSitter } from "../../typings/TreeSitter";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { isString } from "../../util/type";
import { Debug } from "../Debug";
import { ThatMark } from "../ThatMark";
import {
  canonicalizeAndValidateCommand,
  checkForOldInference,
} from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import inferFullTargets from "../inferFullTargets";
import { selectionToThatTarget } from "./selectionToThatTarget";

export class CommandRunner {
  constructor(
    private treeSitter: TreeSitter,
    private debug: Debug,
    private hatTokenMap: HatTokenMap,
    private testCaseRecorder: TestCaseRecorder,
    private actions: ActionRecord,
    private thatMark: ThatMark,
    private sourceMark: ThatMark,
    private modifierStageFactory: ModifierStageFactory,
    private markStageFactory: MarkStageFactory,
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
        getNodeAtLocation: this.treeSitter.getNodeAtLocation,
      };

      if (this.testCaseRecorder.isActive()) {
        const context = {
          targets: targetDescriptors,
          thatMark: this.thatMark,
          sourceMark: this.sourceMark,
          hatTokenMap: readableHatMap,
          spokenForm,
        };
        await this.testCaseRecorder.preCommandHook(commandComplete, context);
      }

      // NB: We do this once test recording has started so that we can capture
      // warning.
      checkForOldInference(partialTargetDescriptors);

      // FIXME: Construct this on a per-request basis in the composition root.
      // Then we don't need `CommandRunner` to depend on these factories and be
      // tightly coupled to `TargetPipeline`.
      const pipeline = new TargetPipeline(
        this.modifierStageFactory,
        this.markStageFactory,
        processedTargetsContext,
      );

      const targets = pipeline.processTargets(targetDescriptors);

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
      const err = e as Error;
      if (!isTesting()) {
        console.error(err.stack);
      }
      await this.testCaseRecorder.commandErrorHook(err);
      throw e;
    } finally {
      if (this.testCaseRecorder.isActive()) {
        this.testCaseRecorder.finallyHook();
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
