import {
  ActionType,
  Command,
  HatTokenMap,
  ReadOnlyHatMap,
} from "@cursorless/common";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { Actions } from "./actions/Actions";
import { Action, ActionRecord } from "./actions/actions.types";
import { CommandRunner, StoredTargetMap, TestCaseRecorder } from "./index";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { TargetPipelineRunner } from "./processTargets";
import { MarkStageFactoryImpl } from "./processTargets/MarkStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { canonicalizeAndValidateCommand } from "./core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { Debug } from "./core/Debug";
import { Snippets } from "./core/Snippets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { captureTestCase } from "./testCaseRecorder/captureTestCase";

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
export async function runCommand(
  debug: Debug,
  hatTokenMap: HatTokenMap,
  testCaseRecorder: TestCaseRecorder,
  snippets: Snippets,
  storedTargets: StoredTargetMap,
  languageDefinitions: LanguageDefinitions,
  rangeUpdater: RangeUpdater,
  command: Command,
) {
  if (debug.active) {
    debug.log(`command:`);
    debug.log(JSON.stringify(command, null, 3));
  }

  const commandComplete = canonicalizeAndValidateCommand(command);
  const {
    action: { name: actionName, args: actionArgs },
    targets: partialTargetDescriptors,
    usePrePhraseSnapshot,
  } = commandComplete;

  const readableHatMap = await hatTokenMap.getReadableMap(usePrePhraseSnapshot);

  const { action, commandRunner } = constructPerRequestComponents(
    snippets,
    storedTargets,
    languageDefinitions,
    rangeUpdater,
    debug,
    readableHatMap,
    actionName,
  );

  if (action == null) {
    throw new Error(`Unknown action ${actionName}`);
  }

  return testCaseRecorder.isActive()
    ? await captureTestCase(
        testCaseRecorder,
        readableHatMap,
        commandComplete,
        () => commandRunner.run(action, actionArgs, partialTargetDescriptors),
      )
    : await commandRunner.run(action, actionArgs, partialTargetDescriptors);
}

function constructPerRequestComponents(
  snippets: Snippets,
  storedTargets: StoredTargetMap,
  languageDefinitions: LanguageDefinitions,
  rangeUpdater: RangeUpdater,
  debug: Debug,
  readableHatMap: ReadOnlyHatMap,
  actionName: ActionType,
): { action: Action | undefined; commandRunner: CommandRunner } {
  const scopeHandlerFactory = new ScopeHandlerFactoryImpl(languageDefinitions);
  const markStageFactory = new MarkStageFactoryImpl(
    readableHatMap,
    storedTargets,
  );
  const modifierStageFactory = new ModifierStageFactoryImpl(
    languageDefinitions,
    scopeHandlerFactory,
  );
  const actions: ActionRecord = new Actions(
    snippets,
    rangeUpdater,
    modifierStageFactory,
  );

  const action = actions[actionName];

  const pipelineRunner = new TargetPipelineRunner(
    modifierStageFactory,
    markStageFactory,
  );

  const commandRunner = new CommandRunner(debug, storedTargets, pipelineRunner);

  return { action, commandRunner };
}
