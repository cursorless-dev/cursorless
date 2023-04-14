import { CommandServerApi, Hats, IDE } from "@cursorless/common";
import { CommandRunner, TestCaseRecorder, ThatMark, TreeSitter } from ".";
import { Actions } from "./actions/Actions";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
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

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap);

  const actions = new Actions(snippets, rangeUpdater);

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  const commandRunner = new CommandRunner(
    treeSitter,
    debug,
    hatTokenMap,
    testCaseRecorder,
    actions,
    thatMark,
    sourceMark,
  );

  return {
    commandRunner,
    testCaseRecorder,
    thatMark,
    sourceMark,
    hatTokenMap,
    snippets,
    injectIde,
  };
}
