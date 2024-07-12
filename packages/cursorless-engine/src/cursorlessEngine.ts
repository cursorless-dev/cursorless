import {
  Command,
  CommandServerApi,
  Hats,
  IDE,
  ScopeProvider,
  ensureCommandShape,
  type RawTreeSitterQueryProvider,
} from "@cursorless/common";
import { KeyboardTargetUpdater } from "./KeyboardTargetUpdater";
import {
  CommandRunnerDecorator,
  CursorlessEngine,
} from "./api/CursorlessEngineApi";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import type { Snippets } from "./core/Snippets";
import { StoredTargetMap } from "./core/StoredTargets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { DisabledCommandServerApi } from "./disabledComponents/DisabledCommandServerApi";
import { DisabledHatTokenMap } from "./disabledComponents/DisabledHatTokenMap";
import { DisabledLanguageDefinitions } from "./disabledComponents/DisabledLanguageDefinitions";
import { DisabledSnippets } from "./disabledComponents/DisabledSnippets";
import { DisabledTalonSpokenForms } from "./disabledComponents/DisabledTalonSpokenForms";
import { CustomSpokenFormGeneratorImpl } from "./generateSpokenForm/CustomSpokenFormGeneratorImpl";
import {
  LanguageDefinitionsImpl,
  type LanguageDefinitions,
} from "./languages/LanguageDefinitions";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { runCommand } from "./runCommand";
import { runIntegrationTests } from "./runIntegrationTests";
import { ScopeInfoProvider } from "./scopeProviders/ScopeInfoProvider";
import { ScopeRangeProvider } from "./scopeProviders/ScopeRangeProvider";
import { ScopeRangeWatcher } from "./scopeProviders/ScopeRangeWatcher";
import { ScopeSupportChecker } from "./scopeProviders/ScopeSupportChecker";
import { ScopeSupportWatcher } from "./scopeProviders/ScopeSupportWatcher";
import { type TalonSpokenForms } from "./scopeProviders/TalonSpokenForms";
import { injectIde } from "./singletons/ide.singleton";
import { TreeSitter } from "./typings/TreeSitter";

// export async function createCursorlessEngine(
//   treeSitter: TreeSitter = new DisabledTreeSitter(),
//   ide: IDE,
//   hats: Hats,
//   commandServerApi: CommandServerApi | null,
//   fileSystem: FileSystem,
//   talonSpokenForms: TalonSpokenForms | undefined,
//   treeSitterQueryProvider: RawTreeSitterQueryProvider | undefined,
//   snippets: Snippets = new DisabledSnippets(),
// ): Promise<CursorlessEngine> {

interface Props {
  ide: IDE;
  hats?: Hats;
  treeSitter: TreeSitter;
  treeSitterQueryProvider: RawTreeSitterQueryProvider | undefined;
  commandServerApi?: CommandServerApi;
  talonSpokenForms?: TalonSpokenForms;
  snippets?: Snippets;
}

export async function createCursorlessEngine({
  ide,
  hats,
  treeSitter,
  treeSitterQueryProvider,
  commandServerApi = new DisabledCommandServerApi(),
  talonSpokenForms = new DisabledTalonSpokenForms(),
  snippets = new DisabledSnippets(),
}: Props): Promise<CursorlessEngine> {
  injectIde(ide);

  const debug = new Debug(ide);
  const rangeUpdater = new RangeUpdater();
  const storedTargets = new StoredTargetMap();
  const keyboardTargetUpdater = new KeyboardTargetUpdater(storedTargets);
  const customSpokenFormGenerator = new CustomSpokenFormGeneratorImpl(
    talonSpokenForms,
  );

  const hatTokenMap =
    hats != null
      ? new HatTokenMapImpl(rangeUpdater, debug, hats, commandServerApi)
      : new DisabledHatTokenMap();
  void hatTokenMap.allocateHats();

  const languageDefinitions = treeSitterQueryProvider
    ? await LanguageDefinitionsImpl.create(
        ide,
        treeSitter,
        treeSitterQueryProvider,
      )
    : new DisabledLanguageDefinitions();

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
