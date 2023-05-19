import { Command, CommandServerApi, Hats, IDE } from "@cursorless/common";
import { StoredTargetMap, TestCaseRecorder, TreeSitter } from ".";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { injectIde } from "./singletons/ide.singleton";
import { upgradeAncientCommand } from "./core/commandVersionUpgrades/upgradeAncientCommand";
import { runCommand } from "./runCommand";

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

      runCommandAncient(
        spokenFormOrCommand: string | Command,
        ...rest: unknown[]
      ) {
        return runCommand(
          debug,
          hatTokenMap,
          testCaseRecorder,
          snippets,
          storedTargets,
          languageDefinitions,
          rangeUpdater,
          upgradeAncientCommand(spokenFormOrCommand, rest),
        );
      },
    },
    testCaseRecorder,
    storedTargets,
    hatTokenMap,
    snippets,
    injectIde,
  };
}

export interface CommandApi {
  runCommand(command: Command): Promise<unknown>;

  /**
   * Runs a command, supporting the form used by very old versions of cursorless-talon
   * @deprecated Use runCommand instead for new clients of the cursorless engine API
   */
  runCommandAncient(
    spokenFormOrCommand: string | Command,
    ...rest: unknown[]
  ): Promise<unknown>;
}

export interface CursorlessEngine {
  commandApi: CommandApi;
  testCaseRecorder: TestCaseRecorder;
  storedTargets: StoredTargetMap;
  hatTokenMap: HatTokenMapImpl;
  snippets: Snippets;
  injectIde: (ide: IDE | undefined) => void;
}
