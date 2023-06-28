import { Command, CommandServerApi, Hats, IDE } from "@cursorless/common";
import {
  ScopeProvider,
  StoredTargetMap,
  TestCaseRecorder,
  TreeSitter,
} from ".";
import { CursorlessEngine } from "./CursorlessEngineApi";
import { ScopeRangeWatcher } from "./ScopeVisualizer";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { ensureCommandShape } from "./core/commandVersionUpgrades/ensureCommandShape";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { runCommand } from "./runCommand";
import { runIntegrationTests } from "./runIntegrationTests";
import { injectIde } from "./singletons/ide.singleton";
import { ScopeRangeProvider } from "./ScopeVisualizer/ScopeRangeProvider";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeSupportChecker } from "./ScopeVisualizer/ScopeSupportChecker";

export function createCursorlessEngine(
  treeSitter: TreeSitter,
  ide: IDE,
  hats: Hats,
  commandServerApi: CommandServerApi | null,
): CursorlessEngine {
  injectIde(ide);

  const debug = new Debug(treeSitter);

  const rangeUpdater = new RangeUpdater();
  ide.disposeOnExit(rangeUpdater);

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

  const languageDefinitions = new LanguageDefinitions(treeSitter);

  return {
    commandApi: {
      runCommand(command: Command) {
        return runCommand(
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
    scopeProvider: createScopeProvider(languageDefinitions, storedTargets),
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

  const rangeWatcher = new ScopeRangeWatcher(rangeProvider);
  const supportChecker = new ScopeSupportChecker(scopeHandlerFactory);

  return {
    provideScopeRanges: rangeProvider.provideScopeRanges,
    provideIterationScopeRanges: rangeProvider.provideIterationScopeRanges,
    onDidChangeScopeRanges: rangeWatcher.onDidChangeScopeRanges,
    onDidChangeIterationScopeRanges:
      rangeWatcher.onDidChangeIterationScopeRanges,
    getScopeSupport: supportChecker.getScopeSupport,
    getIterationScopeSupport: supportChecker.getIterationScopeSupport,
  };
}
