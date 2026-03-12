import type {
  Command,
  CommandServerApi,
  Hats,
  IDE,
  RawTreeSitterQueryProvider,
  ScopeProvider,
  TalonSpokenForms,
  TreeSitter,
} from "@cursorless/common";
import { ensureCommandShape, PassthroughIDE } from "@cursorless/common";
import { KeyboardTargetUpdater } from "./KeyboardTargetUpdater";
import type {
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
import { DisabledTreeSitter } from "./disabledComponents/DisabledTreeSitter";
import { CustomSpokenFormGeneratorImpl } from "./generateSpokenForm/CustomSpokenFormGeneratorImpl";
import {
  LanguageDefinitionsImpl,
  type LanguageDefinitions,
} from "./languages/LanguageDefinitions";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { runCommand } from "./runCommand";
import { ScopeInfoProvider } from "./scopeProviders/ScopeInfoProvider";
import { ScopeRangeProvider } from "./scopeProviders/ScopeRangeProvider";
import { ScopeRangeWatcher } from "./scopeProviders/ScopeRangeWatcher";
import { ScopeSupportChecker } from "./scopeProviders/ScopeSupportChecker";
import { ScopeSupportWatcher } from "./scopeProviders/ScopeSupportWatcher";
import { TokenGraphemeSplitter } from "./tokenGraphemeSplitter/tokenGraphemeSplitter";

export interface EngineProps {
  ide: IDE;
  hats?: Hats;
  treeSitterQueryProvider?: RawTreeSitterQueryProvider;
  treeSitter?: TreeSitter;
  commandServerApi?: CommandServerApi;
  talonSpokenForms?: TalonSpokenForms;
  snippets?: Snippets;
}

export async function createCursorlessEngine({
  ide,
  hats,
  treeSitterQueryProvider,
  treeSitter = new DisabledTreeSitter(),
  commandServerApi = new DisabledCommandServerApi(),
  talonSpokenForms = new DisabledTalonSpokenForms(),
  snippets = new DisabledSnippets(),
}: EngineProps): Promise<CursorlessEngine> {
  const injectedIde = new PassthroughIDE(ide);

  const debug = new Debug(injectedIde);
  const rangeUpdater = new RangeUpdater(injectedIde);
  const tokenGraphemeSplitter = new TokenGraphemeSplitter(injectedIde);

  const storedTargets = new StoredTargetMap();
  const keyboardTargetUpdater = new KeyboardTargetUpdater(
    injectedIde,
    storedTargets,
  );
  const customSpokenFormGenerator = new CustomSpokenFormGeneratorImpl(
    injectedIde,
    talonSpokenForms,
  );

  const hatTokenMap =
    hats != null
      ? new HatTokenMapImpl(
          injectedIde,
          tokenGraphemeSplitter,
          rangeUpdater,
          debug,
          hats,
          commandServerApi,
        )
      : new DisabledHatTokenMap();
  void hatTokenMap.allocateHats();

  const languageDefinitions = treeSitterQueryProvider
    ? await LanguageDefinitionsImpl.create(
        injectedIde,
        treeSitter,
        treeSitterQueryProvider,
      )
    : new DisabledLanguageDefinitions();

  injectedIde.disposeOnExit(
    rangeUpdater,
    tokenGraphemeSplitter,
    languageDefinitions,
    hatTokenMap,
    debug,
    keyboardTargetUpdater,
    customSpokenFormGenerator,
  );

  const commandRunnerDecorators: CommandRunnerDecorator[] = [];

  let previousCommand: Command | undefined = undefined;

  const runCommandClosure = (command: Command) => {
    previousCommand = command;
    return runCommand(
      injectedIde,
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
    languageDefinitions,
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
      injectedIde,
      languageDefinitions,
      storedTargets,
      customSpokenFormGenerator,
    ),
    customSpokenFormGenerator,
    storedTargets,
    hatTokenMap,
    injectIde: (ide) => injectedIde.setIde(ide),
    addCommandRunnerDecorator: (decorator: CommandRunnerDecorator) => {
      commandRunnerDecorators.push(decorator);
    },
  };
}

function createScopeProvider(
  ide: IDE,
  languageDefinitions: LanguageDefinitions,
  storedTargets: StoredTargetMap,
  customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
): ScopeProvider {
  const scopeHandlerFactory = new ScopeHandlerFactoryImpl(
    ide,
    languageDefinitions,
  );

  const rangeProvider = new ScopeRangeProvider(
    scopeHandlerFactory,
    new ModifierStageFactoryImpl(
      languageDefinitions,
      storedTargets,
      scopeHandlerFactory,
    ),
  );

  const rangeWatcher = new ScopeRangeWatcher(
    ide,
    languageDefinitions,
    rangeProvider,
  );
  const supportChecker = new ScopeSupportChecker(scopeHandlerFactory);
  const infoProvider = new ScopeInfoProvider(customSpokenFormGenerator);
  const supportWatcher = new ScopeSupportWatcher(
    ide,
    languageDefinitions,
    supportChecker,
    infoProvider,
  );
  ide.disposeOnExit(rangeWatcher, infoProvider, supportWatcher);

  return {
    provideScopeRanges: rangeProvider.provideScopeRanges,
    provideScopeRangesForRange: rangeProvider.provideScopeRangesForRange,
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
