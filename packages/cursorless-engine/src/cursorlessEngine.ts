import {
  Command,
  CommandServerApi,
  Hats,
  IDE,
  ScopeType,
} from "@cursorless/common";
import { StoredTargetMap, TestCaseRecorder, TreeSitter } from ".";
import { VisualizationType } from "./VisualizationType";
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
import { ScopeVisualizer as ScopeVisualizerImpl } from "./ScopeVisualizer";

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

  const scopeVisualizer = new ScopeVisualizerImpl(
    new ScopeHandlerFactoryImpl(languageDefinitions),
  );

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
    scopeVisualizer: {
      start(scopeType: ScopeType, visualizationType: string) {
        return scopeVisualizer.setScopeType({
          scopeType,
          visualizationType: visualizationType as VisualizationType,
        });
      },
      stop() {
        return scopeVisualizer.setScopeType(undefined);
      },
    },
    testCaseRecorder,
    storedTargets,
    hatTokenMap,
    snippets,
    injectIde,
    runIntegrationTests: () =>
      runIntegrationTests(treeSitter, languageDefinitions),
  };
}

export interface CommandApi {
  /**
   * Runs a command.  This is the core of the Cursorless engine.
   * @param command The command to run
   */
  runCommand(command: Command): Promise<unknown>;

  /**
   * Designed to run commands that come directly from the user.  Ensures that
   * the command args are of the correct shape.
   */
  runCommandSafe(...args: unknown[]): Promise<unknown>;
}

export interface ScopeVisualizer {
  start(scopeType: ScopeType, visualizationType: string): Promise<void>;
  stop(): Promise<void>;
}

export interface CursorlessEngine {
  commandApi: CommandApi;
  scopeVisualizer: ScopeVisualizer;
  testCaseRecorder: TestCaseRecorder;
  storedTargets: StoredTargetMap;
  hatTokenMap: HatTokenMapImpl;
  snippets: Snippets;
  injectIde: (ide: IDE | undefined) => void;
  runIntegrationTests: () => Promise<void>;
}
