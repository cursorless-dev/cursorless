import {
  Disposable,
  IterationScopeChangeEventCallback,
  IterationScopeRangeConfig,
  ScopeChangeEventCallback,
  ScopeRangeConfig,
} from "@cursorless/common";
import { pull } from "lodash";
import { Debouncer } from "../core/Debouncer";
import { ide } from "../singletons/ide.singleton";
import { ScopeRangeProvider } from "./ScopeRangeProvider";

type Listener = () => void;

export class ScopeRangeWatcher {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.onChange());
  private listeners: Listener[] = [];

  constructor(private scopeRangeProvider: ScopeRangeProvider) {
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
      this.debouncer,
    );

    this.onDidChangeScopeRanges = this.onDidChangeScopeRanges.bind(this);
    this.onDidChangeIterationScopeRanges =
      this.onDidChangeIterationScopeRanges.bind(this);
  }

  onDidChangeScopeRanges(
    callback: ScopeChangeEventCallback,
    config: ScopeRangeConfig,
  ): Disposable {
    const fn = () => {
      ide().visibleTextEditors.forEach((editor) => {
        callback(
          editor,
          this.scopeRangeProvider.provideScopeRanges(editor, config),
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
        // do nothing
      }
    });
  }
}
