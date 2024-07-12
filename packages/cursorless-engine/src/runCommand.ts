import {
  Command,
  CommandResponse,
  CommandServerApi,
  HatTokenMap,
  ReadOnlyHatMap,
  clientSupportsFallback,
} from "@cursorless/common";
import { CommandRunner } from "./CommandRunner";
import { Actions } from "./actions/Actions";
import { CommandRunnerDecorator } from "./api/CursorlessEngineApi";
import { Debug } from "./core/Debug";
import { CommandRunnerImpl } from "./core/commandRunner/CommandRunnerImpl";
import { canonicalizeAndValidateCommand } from "./core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { StoredTargetMap, TreeSitter, type Snippets } from "./index";
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
  treeSitter: TreeSitter,
  commandServerApi: CommandServerApi,
  debug: Debug,
  hatTokenMap: HatTokenMap,
  snippets: Snippets,
  storedTargets: StoredTargetMap,
  languageDefinitions: LanguageDefinitions,
  rangeUpdater: RangeUpdater,
  commandRunnerDecorators: CommandRunnerDecorator[],
  command: Command,
): Promise<CommandResponse | unknown> {
  if (debug.active) {
    debug.log(`command:`);
    debug.log(JSON.stringify(command, null, 2));
  }

  const commandComplete = canonicalizeAndValidateCommand(command);

  const readableHatMap = await hatTokenMap.getReadableMap(
    commandComplete.usePrePhraseSnapshot,
  );

  let commandRunner = createCommandRunner(
    treeSitter,
    commandServerApi,
    languageDefinitions,
    debug,
    storedTargets,
    readableHatMap,
    snippets,
    rangeUpdater,
  );

  for (const decorator of commandRunnerDecorators) {
    commandRunner = decorator.wrapCommandRunner(readableHatMap, commandRunner);
  }

  const response = await commandRunner.run(commandComplete);

  return await unwrapLegacyCommandResponse(command, response);
}

async function unwrapLegacyCommandResponse(
  command: Command,
  response: CommandResponse,
): Promise<CommandResponse | unknown> {
  if (clientSupportsFallback(command)) {
    return response;
  }
  if ("returnValue" in response) {
    return response.returnValue;
  }
  return undefined;
}

function createCommandRunner(
  treeSitter: TreeSitter,
  commandServerApi: CommandServerApi,
  languageDefinitions: LanguageDefinitions,
  debug: Debug,
  storedTargets: StoredTargetMap,
  readableHatMap: ReadOnlyHatMap,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
): CommandRunner {
  const modifierStageFactory = new ModifierStageFactoryImpl(
    languageDefinitions,
    storedTargets,
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
    commandServerApi,
    debug,
    storedTargets,
    targetPipelineRunner,
    new Actions(treeSitter, snippets, rangeUpdater, modifierStageFactory),
  );
}
