import { CommandServerApi, Hats, IDE } from "@cursorless/common";
import {
  CommandRunner,
  StoredTargetMap,
  TestCaseRecorder,
  TreeSitter,
} from ".";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { injectIde } from "./singletons/ide.singleton";

export function createCursorlessEngine(
  treeSitter: TreeSitter,
  ide: IDE,
  hats: Hats,
  commandServerApi: CommandServerApi | null,
) {
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

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap);

  const languageDefinitions = new LanguageDefinitions(treeSitter);

  const commandRunner = new CommandRunner(
    treeSitter,
    debug,
    hatTokenMap,
    testCaseRecorder,
    snippets,
    storedTargets,
    languageDefinitions,
    rangeUpdater,
  );

  return {
    commandRunner,
    testCaseRecorder,
    storedTargets,
    hatTokenMap,
    snippets,
    injectIde,
  };
}
