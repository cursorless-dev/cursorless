import { Command, HatTokenMap, ReadOnlyHatMap } from "@cursorless/common";
import { CommandRunner } from "./CommandRunner";
import { Actions } from "./actions/Actions";
import { Debug } from "./core/Debug";
import { Snippets } from "./core/Snippets";
import { CommandRunnerImpl } from "./core/commandRunner/CommandRunnerImpl";
import { canonicalizeAndValidateCommand } from "./core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { StoredTargetMap, TestCaseRecorder } from "./index";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { TargetPipelineRunner } from "./processTargets";
import { MarkStageFactoryImpl } from "./processTargets/MarkStageFactoryImpl";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";

/**
 * Entry point for Cursorless commands. We proceed as follows:
 *
 * 1. Canonicalize the action name and target representation using
 *    {@link canonicalizeAndValidateCommand}, primarily for the purpose of
 *    backwards compatibility
 * 2. Take a snapshot of the hat token map, if requested by the command
 * 3. Construct the {@link CommandRunnerImpl}.
 * 4. Wrap the command runner in a {@link TestCaseRecorder} if test recording is
 *    active.
 * 5. Call {@link CommandRunnerImpl.run} to run the actual command.
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
): Promise<unknown> {
  if (debug.active) {
    debug.log(`command:`);
    debug.log(JSON.stringify(command, null, 3));
  }

  const commandComplete = canonicalizeAndValidateCommand(command);

  const readableHatMap = await hatTokenMap.getReadableMap(
    commandComplete.usePrePhraseSnapshot,
  );

  let commandRunner = createCommandRunner(
    languageDefinitions,
    debug,
    storedTargets,
    readableHatMap,
    snippets,
    rangeUpdater,
  );

  if (testCaseRecorder.isActive()) {
    commandRunner = testCaseRecorder.wrapCommandRunner(
      readableHatMap,
      commandRunner,
    );
  }

  return await commandRunner.run(commandComplete);
}

function createCommandRunner(
  languageDefinitions: LanguageDefinitions,
  debug: Debug,
  storedTargets: StoredTargetMap,
  readableHatMap: ReadOnlyHatMap,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
): CommandRunner {
  const modifierStageFactory = new ModifierStageFactoryImpl(
    languageDefinitions,
    new ScopeHandlerFactoryImpl(languageDefinitions),
  );

  const markStageFactory = new MarkStageFactoryImpl(
    readableHatMap,
    storedTargets,
  );
  const targetPipelineRunner = new TargetPipelineRunner(
    modifierStageFactory,
    markStageFactory,
  );
  markStageFactory.setPipelineRunner(targetPipelineRunner);
  return new CommandRunnerImpl(
    debug,
    storedTargets,
    targetPipelineRunner,
    new Actions(snippets, rangeUpdater, modifierStageFactory),
  );
}
