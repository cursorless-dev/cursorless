import {
  Command,
  CommandServerApi,
  ensureCommandShape,
  FileSystem,
  Hats,
  IDE,
  ScopeProvider,
} from "@cursorless/common";
import {
  CommandRunnerDecorator,
  CursorlessEngine,
} from "./api/CursorlessEngineApi";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import type { Snippets } from "./core/Snippets";
import { StoredTargetMap } from "./core/StoredTargets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { DisabledHatTokenMap } from "./disabledComponents/DisabledHatTokenMap";
import { DisabledSnippets } from "./disabledComponents/DisabledSnippets";
import { CustomSpokenFormGeneratorImpl } from "./generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { KeyboardTargetUpdater } from "./KeyboardTargetUpdater";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import {
  DisabledTalonSpokenFormsJsonReader,
  TalonSpokenFormsJsonReader,
} from "./nodeCommon/TalonSpokenFormsJsonReader";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { runCommand } from "./runCommand";
import { runIntegrationTests } from "./runIntegrationTests";
import { ScopeInfoProvider } from "./scopeProviders/ScopeInfoProvider";
import { ScopeRangeProvider } from "./scopeProviders/ScopeRangeProvider";
import { ScopeRangeWatcher } from "./scopeProviders/ScopeRangeWatcher";
import { ScopeSupportChecker } from "./scopeProviders/ScopeSupportChecker";
import { ScopeSupportWatcher } from "./scopeProviders/ScopeSupportWatcher";
import { injectIde } from "./singletons/ide.singleton";
import { TreeSitter } from "./typings/TreeSitter";

interface Props {
  ide: IDE;
  fileSystem?: FileSystem;
  hats?: Hats;
  treeSitter?: TreeSitter;
  commandServerApi?: CommandServerApi;
  snippets?: Snippets;
}

export async function createCursorlessEngine({
  ide,
  fileSystem,
  hats,
  treeSitter,
  commandServerApi,
  snippets = new DisabledSnippets(),
}: Props): Promise<CursorlessEngine> {
  injectIde(ide);

  const debug = new Debug(treeSitter);

  const rangeUpdater = new RangeUpdater();

  const hatTokenMap =
    hats != null
      ? new HatTokenMapImpl(rangeUpdater, debug, hats, commandServerApi)
      : new DisabledHatTokenMap();

  void hatTokenMap.allocateHats();

  const storedTargets = new StoredTargetMap();

  const keyboardTargetUpdater = new KeyboardTargetUpdater(storedTargets);

  const languageDefinitions = new LanguageDefinitions(fileSystem, treeSitter);
  await languageDefinitions.init();

  const talonSpokenForms =
    fileSystem != null
      ? new TalonSpokenFormsJsonReader(fileSystem)
      : new DisabledTalonSpokenFormsJsonReader();

  const customSpokenFormGenerator = new CustomSpokenFormGeneratorImpl(
    talonSpokenForms,
  );

  ide.disposeOnExit(
    rangeUpdater,
    languageDefinitions,
    hatTokenMap,
    debug,
    keyboardTargetUpdater,
  );

  const commandRunnerDecorators: CommandRunnerDecorator[] = [];

  let previousCommand: Command | undefined = undefined;

  const runCommandClosure = (command: Command) => {
    previousCommand = command;
    return runCommand(
      treeSitter,
      commandServerApi,
      debug,
      hatTokenMap,
      snippets,
      storedTargets,
      languageDefinitions,
      rangeUpdater,
      commandRunnerDecorators,
      command,
    );
  };

  return {
    commandApi: {
      runCommand(command: Command) {
        return runCommandClosure(command);
      },

      runCommandSafe(...args: unknown[]) {
        return runCommandClosure(ensureCommandShape(args));
      },

      repeatPreviousCommand() {
        if (previousCommand == null) {
          throw new Error("No previous command");
        }

        return runCommandClosure(previousCommand);
      },
    },
    scopeProvider: createScopeProvider(
      languageDefinitions,
      storedTargets,
      customSpokenFormGenerator,
    ),
    customSpokenFormGenerator,
    storedTargets,
    hatTokenMap,
    injectIde,
    runIntegrationTests: () =>
      runIntegrationTests(treeSitter, languageDefinitions),
    addCommandRunnerDecorator: (decorator: CommandRunnerDecorator) => {
      commandRunnerDecorators.push(decorator);
    },
  };
}

function createScopeProvider(
  languageDefinitions: LanguageDefinitions,
  storedTargets: StoredTargetMap,
  customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
): ScopeProvider {
  const scopeHandlerFactory = new ScopeHandlerFactoryImpl(languageDefinitions);

  const rangeProvider = new ScopeRangeProvider(
    scopeHandlerFactory,
    new ModifierStageFactoryImpl(
      languageDefinitions,
      storedTargets,
      scopeHandlerFactory,
    ),
  );

  const rangeWatcher = new ScopeRangeWatcher(
    languageDefinitions,
    rangeProvider,
  );
  const supportChecker = new ScopeSupportChecker(scopeHandlerFactory);
  const infoProvider = new ScopeInfoProvider(customSpokenFormGenerator);
  const supportWatcher = new ScopeSupportWatcher(
    languageDefinitions,
    supportChecker,
    infoProvider,
  );

  return {
    provideScopeRanges: rangeProvider.provideScopeRanges,
    provideIterationScopeRanges: rangeProvider.provideIterationScopeRanges,
    onDidChangeScopeRanges: rangeWatcher.onDidChangeScopeRanges,
    onDidChangeIterationScopeRanges:
      rangeWatcher.onDidChangeIterationScopeRanges,
    getScopeSupport: supportChecker.getScopeSupport,
    getIterationScopeSupport: supportChecker.getIterationScopeSupport,
    onDidChangeScopeSupport: supportWatcher.onDidChangeScopeSupport,
    getScopeInfo: infoProvider.getScopeTypeInfo,
    onDidChangeScopeInfo: infoProvider.onDidChangeScopeInfo,
  };
}
