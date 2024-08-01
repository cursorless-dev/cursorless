import type {
  Disposable,
  ScopeSupportEventCallback,
  ScopeSupportInfo,
  ScopeType,
} from "@cursorless/common";
import { ScopeSupport, disposableFrom } from "@cursorless/common";
import { pull } from "lodash-es";

import type { LanguageDefinitions } from "../languages/LanguageDefinitions";
import { ide } from "../singletons/ide.singleton";
import { DecorationDebouncer } from "../util/DecorationDebouncer";
import type { ScopeInfoProvider } from "./ScopeInfoProvider";
import type { ScopeSupportChecker } from "./ScopeSupportChecker";

/**
 * Watches for changes to the scope support of the active editor and notifies
 * listeners when it changes. Watches support for all scopes at the same time.
 */
export class ScopeSupportWatcher {
  private disposable: Disposable;
  private listeners: ScopeSupportEventCallback[] = [];

  constructor(
    languageDefinitions: LanguageDefinitions,
    private scopeSupportChecker: ScopeSupportChecker,
    private scopeInfoProvider: ScopeInfoProvider,
  ) {
    this.onChange = this.onChange.bind(this);
    this.onDidChangeScopeSupport = this.onDidChangeScopeSupport.bind(this);

    const debouncer = new DecorationDebouncer(ide().configuration, () =>
      this.onChange(),
    );

    this.disposable = disposableFrom(
      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(debouncer.run),
      // An Event that fires when a text document closes
      ide().onDidCloseTextDocument(debouncer.run),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(debouncer.run),
      // An event that is emitted when a text document is changed. This usually
      // happens when the contents changes but also when other things like the
      // dirty-state changes.
      ide().onDidChangeTextDocument(debouncer.run),
      languageDefinitions.onDidChangeDefinition(debouncer.run),
      this.scopeInfoProvider.onDidChangeScopeInfo(this.onChange),
      debouncer,
    );
  }

  /**
   * Registers a callback to be run when the scope support changes for the active
   * editor.  The callback will be run immediately once with the current support
   * levels for the active editor.
   *
   * Note that this watcher could be expensive, because it runs all the scope
   * handlers for the active editor every time the content of the active editor
   * changes. If you only need info about the available scopes, including their
   * spoken forms, you should use {@link onDidChangeScopeInfo} instead.
   * @param callback The callback to run when the scope support changes
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeScopeSupport(callback: ScopeSupportEventCallback): Disposable {
    callback(this.getSupportLevels());

    this.listeners.push(callback);

    return {
      dispose: () => {
        pull(this.listeners, callback);
      },
    };
  }

  private onChange() {
    if (this.listeners.length === 0) {
      // Don't bother if no one is listening
      return;
    }

    const supportLevels = this.getSupportLevels();

    this.listeners.forEach((listener) => listener(supportLevels));
  }

  private getSupportLevels(): ScopeSupportInfo[] {
    const activeTextEditor = ide().activeTextEditor;

    const getScopeTypeSupport =
      activeTextEditor == null
        ? () => ScopeSupport.unsupported
        : (scopeType: ScopeType) =>
            this.scopeSupportChecker.getScopeSupport(
              activeTextEditor,
              scopeType,
            );

    const getIterationScopeTypeSupport =
      activeTextEditor == null
        ? () => ScopeSupport.unsupported
        : (scopeType: ScopeType) =>
            this.scopeSupportChecker.getIterationScopeSupport(
              activeTextEditor,
              scopeType,
            );

    const scopeTypeInfos = this.scopeInfoProvider.getScopeTypeInfos();

    return scopeTypeInfos.map((scopeTypeInfo) => ({
      ...scopeTypeInfo,
      support: getScopeTypeSupport(scopeTypeInfo.scopeType),
      iterationScopeSupport: getIterationScopeTypeSupport(
        scopeTypeInfo.scopeType,
      ),
    }));
  }

  dispose() {
    this.disposable.dispose();
  }
}
