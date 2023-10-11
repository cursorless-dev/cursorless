import {
  Disposable,
  ScopeSupport,
  ScopeSupportEventCallback,
  ScopeSupportInfo,
  ScopeType,
} from "@cursorless/common";
import { pull } from "lodash";

import { Debouncer } from "../core/Debouncer";
import { LanguageDefinitions } from "../languages/LanguageDefinitions";
import { ide } from "../singletons/ide.singleton";
import { ScopeInfoProvider } from "./ScopeInfoProvider";
import { ScopeSupportChecker } from "./ScopeSupportChecker";

/**
 * Watches for changes to the scope support of the active editor and notifies
 * listeners when it changes. Watches support for all scopes at the same time.
 */
export class ScopeSupportWatcher {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.onChange());
  private listeners: ScopeSupportEventCallback[] = [];

  constructor(
    languageDefinitions: LanguageDefinitions,
    private scopeSupportChecker: ScopeSupportChecker,
    private scopeInfoProvider: ScopeInfoProvider,
  ) {
    this.disposables.push(
      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.debouncer.run),
      // An Event that fires when a text document closes
      ide().onDidCloseTextDocument(this.debouncer.run),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(this.debouncer.run),
      // An event that is emitted when a text document is changed. This usually
      // happens when the contents changes but also when other things like the
      // dirty-state changes.
      ide().onDidChangeTextDocument(this.debouncer.run),
      languageDefinitions.onDidChangeDefinition(this.debouncer.run),
      this.scopeInfoProvider.onDidChangeScopeInfo(() => this.onChange()),
      this.debouncer,
    );

    this.onDidChangeScopeSupport = this.onDidChangeScopeSupport.bind(this);
  }

  /**
   * Registers a callback to be run when the scope ranges change for any visible
   * editor.  The callback will be run immediately once for each visible editor
   * with the current scope ranges.
   * @param callback The callback to run when the scope ranges change
   * @param config The configuration for the scope ranges
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

  dispose(): void {
    this.disposables.forEach(({ dispose }) => {
      try {
        dispose();
      } catch (e) {
        // do nothing; some of the VSCode disposables misbehave, and we don't
        // want that to prevent us from disposing the rest of the disposables
      }
    });
  }
}
