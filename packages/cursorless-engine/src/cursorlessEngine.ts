import {
  Command,
  CommandServerApi,
  FileSystem,
  Hats,
  IDE,
} from "@cursorless/common";
import { StoredTargetMap, TestCaseRecorder, TreeSitter } from ".";
import { CursorlessEngine } from "./api/CursorlessEngineApi";
import { ScopeProvider } from "./api/ScopeProvider";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { ensureCommandShape } from "./core/commandVersionUpgrades/ensureCommandShape";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { CustomSpokenFormGeneratorImpl } from "./generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { runCommand } from "./runCommand";
import { runIntegrationTests } from "./runIntegrationTests";
import { ScopeInfoProvider } from "./scopeProviders/ScopeInfoProvider";
import { ScopeRangeProvider } from "./scopeProviders/ScopeRangeProvider";
import { ScopeRangeWatcher } from "./scopeProviders/ScopeRangeWatcher";
import { ScopeSupportChecker } from "./scopeProviders/ScopeSupportChecker";
import { ScopeSupportWatcher } from "./scopeProviders/ScopeSupportWatcher";
import { injectIde } from "./singletons/ide.singleton";
import { TalonSpokenFormsJsonReader } from "./scopeProviders/getSpokenFormEntries";

export function createCursorlessEngine(
  treeSitter: TreeSitter,
  ide: IDE,
  hats: Hats,
  commandServerApi: CommandServerApi | null,
  fileSystem: FileSystem,
): CursorlessEngine {
  injectIde(ide);

  const debug = new Debug(treeSitter);

  const rangeUpdater = new RangeUpdater();

  const snippets = new Snippets();
  snippets.init();

  const hatTokenMap = new HatTokenMapImpl(
    rangeUpdater,
    debug,
    hats,
    commandServerApi,
  );
  hatTokenMap.allocateHats();

  const storedTargets = new StoredTargetMap();

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap, storedTargets);

  const languageDefinitions = new LanguageDefinitions(fileSystem, treeSitter);

  const talonSpokenForms = new TalonSpokenFormsJsonReader(fileSystem);

  const customSpokenFormGenerator = new CustomSpokenFormGeneratorImpl(
    talonSpokenForms,
  );

  ide.disposeOnExit(rangeUpdater, languageDefinitions, hatTokenMap, debug);

  console.log("createCursorlessEngine");

  return {
    commandApi: {
      runCommand(command: Command) {
        return runCommand(
          treeSitter,
          debug,
          hatTokenMap,
          testCaseRecorder,
          snippets,
          storedTargets,
          languageDefinitions,
          rangeUpdater,
          command,
        );
      },

      runCommandSafe(...args: unknown[]) {
        return runCommand(
          treeSitter,
          debug,
          hatTokenMap,
          testCaseRecorder,
          snippets,
          storedTargets,
          languageDefinitions,
          rangeUpdater,
          ensureCommandShape(args),
        );
      },
    },
    scopeProvider: createScopeProvider(
      languageDefinitions,
      storedTargets,
      customSpokenFormGenerator,
    ),
    customSpokenFormGenerator,
    testCaseRecorder,
    storedTargets,
    hatTokenMap,
    snippets,
    injectIde,
    runIntegrationTests: () =>
      runIntegrationTests(treeSitter, languageDefinitions),
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
    onDidChangeScopeInfo: infoProvider.onDidChangeScopeInfo,
  };
}
