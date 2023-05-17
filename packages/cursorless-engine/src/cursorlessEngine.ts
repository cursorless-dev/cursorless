import { CommandServerApi, Hats, IDE } from "@cursorless/common";
import { CommandRunner, TestCaseRecorder, ThatMark, TreeSitter } from ".";
import { Actions } from "./actions/Actions";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { MarkStageFactoryImpl } from "./processTargets/MarkStageFactoryImpl";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { injectIde } from "./singletons/ide.singleton";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";

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

  const languageDefinitions = new LanguageDefinitions(treeSitter);
  const scopeHandlerFactory = new ScopeHandlerFactoryImpl(languageDefinitions);
  const markStageFactory = new MarkStageFactoryImpl();
  const modifierStageFactory = new ModifierStageFactoryImpl(
    languageDefinitions,
    scopeHandlerFactory,
  );
  const actions = new Actions(snippets, rangeUpdater, modifierStageFactory);

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
    modifierStageFactory,
    markStageFactory,
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
