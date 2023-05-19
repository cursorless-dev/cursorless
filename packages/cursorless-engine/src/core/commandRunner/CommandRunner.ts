import {
  ActionType,
  Command,
  HatTokenMap,
  isTesting,
  PartialTargetV0V1,
} from "@cursorless/common";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { Actions } from "../../actions/Actions";
import { ActionRecord } from "../../actions/actions.types";
import { StoredTargetMap, TestCaseRecorder } from "../../index";
import { LanguageDefinitions } from "../../languages/LanguageDefinitions";
import { TargetPipelineRunner } from "../../processTargets";
import { MarkStageFactoryImpl } from "../../processTargets/MarkStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "../../processTargets/modifiers/scopeHandlers";
import { ModifierStageFactoryImpl } from "../../processTargets/ModifierStageFactoryImpl";
import { Target } from "../../typings/target.types";
import { TreeSitter } from "../../typings/TreeSitter";
import { SelectionWithEditor } from "../../typings/Types";
import { isString } from "../../util/type";
import {
  canonicalizeAndValidateCommand,
  checkForOldInference,
} from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import { Debug } from "../Debug";
import inferFullTargets from "../inferFullTargets";
import { Snippets } from "../Snippets";
import { RangeUpdater } from "../updateSelections/RangeUpdater";
import { selectionToThatTarget } from "./selectionToThatTarget";

export class CommandRunner {
  constructor(
    private treeSitter: TreeSitter,
    private debug: Debug,
    private hatTokenMap: HatTokenMap,
    private testCaseRecorder: TestCaseRecorder,
    private snippets: Snippets,
    private storedTargets: StoredTargetMap,
    private languageDefinitions: LanguageDefinitions,
    private rangeUpdater: RangeUpdater,
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
   *    like previous targets. For example we would automatically infer that
   *    `"take funk air and bat"` is equivalent to `"take funk air and funk
   *    bat"`. See {@link inferFullTargets} for details of how this is done.
   * 3. Call {@link processTargets} to map each abstract {@link Target} object
   *    to a concrete list of {@link Target} objects.
   * 4. Run the requested action on the given selections. The mapping from
   *    action id (eg `remove`) to implementation is defined in {@link Actions}.
   *    To understand how actions work, see some examples, such as `"take"`
   *    {@link SetSelection} and `"chuck"` {@link Delete}. See
   * 5. Update `source` and `that` marks, if they have been returned from the
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
        action: { name: actionName, args: actionArgs },
        targets: partialTargetDescriptors,
        usePrePhraseSnapshot,
      } = commandComplete;

      const readableHatMap = await this.hatTokenMap.getReadableMap(
        usePrePhraseSnapshot,
      );

      const scopeHandlerFactory = new ScopeHandlerFactoryImpl(
        this.languageDefinitions,
      );
      const markStageFactory = new MarkStageFactoryImpl(
        readableHatMap,
        this.storedTargets,
      );
      const modifierStageFactory = new ModifierStageFactoryImpl(
        this.languageDefinitions,
        scopeHandlerFactory,
      );
      const actions: ActionRecord = new Actions(
        this.snippets,
        this.rangeUpdater,
        modifierStageFactory,
      );
      const pipelineRunner = new TargetPipelineRunner(
        modifierStageFactory,
        markStageFactory,
      );

      const action = actions[actionName];

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

      if (this.testCaseRecorder.isActive()) {
        await this.testCaseRecorder.preCommandHook(
          readableHatMap,
          commandComplete,
        );
      }

      // NB: We do this once test recording has started so that we can capture
      // warning.
      checkForOldInference(partialTargetDescriptors);

      const targets = pipelineRunner.run(
        targetDescriptors,
        actionPrePositionStages,
        actionFinalStages,
      );

      const {
        returnValue,
        thatSelections: newThatSelections,
        thatTargets: newThatTargets,
        sourceSelections: newSourceSelections,
        sourceTargets: newSourceTargets,
      } = await action.run(targets, ...actionArgs);

      this.storedTargets.set(
        "that",
        constructThatTarget(newThatTargets, newThatSelections),
      );
      this.storedTargets.set(
        "source",
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
