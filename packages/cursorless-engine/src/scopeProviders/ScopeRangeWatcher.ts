import {
  Disposable,
  IterationScopeChangeEventCallback,
  IterationScopeRangeConfig,
  ScopeChangeEventCallback,
  ScopeRangeConfig,
  ScopeRanges,
  showError,
} from "@cursorless/common";
import { pull } from "lodash";

import { Debouncer } from "../core/Debouncer";
import { LanguageDefinitions } from "../languages/LanguageDefinitions";
import { ide } from "../singletons/ide.singleton";
import { ScopeRangeProvider } from "./ScopeRangeProvider";

/**
 * Watches for changes to the scope ranges of visible editors and notifies
 * listeners when they change.
 */
export class ScopeRangeWatcher {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.onChange());
  private listeners: (() => void)[] = [];

  constructor(
    languageDefinitions: LanguageDefinitions,
    private scopeRangeProvider: ScopeRangeProvider,
  ) {
    this.disposables.push(
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.debouncer.run),
      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.debouncer.run),
      // An Event that fires when a text document closes
      ide().onDidCloseTextDocument(this.debouncer.run),
      // An event that is emitted when a text document is changed. This usually
      // happens when the contents changes but also when other things like the
      // dirty-state changes.
      ide().onDidChangeTextDocument(this.debouncer.run),
      ide().onDidChangeTextEditorVisibleRanges(this.debouncer.run),
      languageDefinitions.onDidChangeDefinition(this.debouncer.run),
      this.debouncer,
    );

    this.onDidChangeScopeRanges = this.onDidChangeScopeRanges.bind(this);
    this.onDidChangeIterationScopeRanges =
      this.onDidChangeIterationScopeRanges.bind(this);
  }

  /**
   * Registers a callback to be run when the scope ranges change for any visible
   * editor.  The callback will be run immediately once for each visible editor
   * with the current scope ranges.
   * @param callback The callback to run when the scope ranges change
   * @param config The configuration for the scope ranges
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeScopeRanges(
    callback: ScopeChangeEventCallback,
    config: ScopeRangeConfig,
  ): Disposable {
    const fn = () => {
      ide().visibleTextEditors.forEach((editor) => {
        let scopeRanges: ScopeRanges[];
        try {
          scopeRanges = this.scopeRangeProvider.provideScopeRanges(
            editor,
            config,
          );
        } catch (err) {
          showError(
            ide().messages,
            "ScopeRangeWatcher.provide",
            (err as Error).message,
          );
          // If there was a problem getting scopes for an editor, we show an
          // error and clear any scopes we might have shown last time. This is
          // especially important during development, but also seems like the
          // robust thing to do generally.
          scopeRanges = [];

          if (ide().runMode === "test") {
            // Fail hard if we're in test mode; otherwise recover
            throw err;
          }
        }

        callback(editor, scopeRanges);
      });
    };

    this.listeners.push(fn);

    fn();

    return {
      dispose: () => {
        pull(this.listeners, fn);
      },
    };
  }

  /**
   * Registers a callback to be run when the iteration scope ranges change for
   * any visible editor.  The callback will be run immediately once for each
   * visible editor with the current iteration scope ranges.
   * @param callback The callback to run when the scope ranges change
   * @param config The configuration for the scope ranges
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeIterationScopeRanges(
    callback: IterationScopeChangeEventCallback,
    config: IterationScopeRangeConfig,
  ): Disposable {
    const fn = () => {
      ide().visibleTextEditors.forEach((editor) => {
        callback(
          editor,
          this.scopeRangeProvider.provideIterationScopeRanges(editor, config),
        );
      });
    };

    this.listeners.push(fn);

    fn();

    return {
      dispose: () => {
        pull(this.listeners, fn);
      },
    };
  }

  private onChange() {
    this.listeners.forEach((listener) => listener());
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
