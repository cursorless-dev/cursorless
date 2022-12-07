import { pull } from "lodash";
import * as vscode from "vscode";
import { Disposable } from "vscode";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Graph } from "../typings/Types";

const GLOBAL_WHEN_CLAUSE_CONTEXT = "cursorless.keyboard.listening";

interface Listener {
  displayOptions: DisplayOptions;
  handleInput(text: string): Promise<unknown>;
  handleCancelled(): void;
}

interface DisplayOptions {
  cursorStyle: vscode.TextEditorCursorStyle;
  whenClauseContext?: string;
  statusBarText?: string;
}

interface ListenerEntry {
  listener: Listener;
  disposable: Disposable;
}

/**
 * Expected shape of the argument to the built-in vscode "type" command
 */
interface TypeCommandArg {
  text: string;
}

/**
 * Allows other components to register to listen to typing events.  Note that
 * only one listener can be active at a time, and having any listeners active
 * will cause typing not to work.
 */
export default class KeyboardHandler {
  private listeners: ListenerEntry[] = [];
  private activeListener: ListenerEntry | undefined;
  private typeCommandDisposable?: Disposable;
  private isActivated = false;
  private disposables: Disposable[] = [];

  constructor(private graph: Graph) {
    this.cancelActiveListener = this.cancelActiveListener.bind(this);
    ide().disposeOnExit(this);
  }

  init() {
    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.keyboard.escape",
        this.cancelActiveListener,
      ),
      vscode.window.onDidChangeActiveTextEditor((textEditor) => {
        if (!textEditor) {
          return;
        }

        const relinquishCursorControlOnDeactivate = vscode.workspace
          .getConfiguration("cursorless.keyboard")
          .get<boolean>(`relinquishCursorControlOnDeactivate`)!;

        if (
          !relinquishCursorControlOnDeactivate ||
          this.activeListener != null
        ) {
          this.ensureCursorStyle();
        }
      }),
    );

    this.ensureState();
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }

  /**
   * Registers a listener to take over listening to typing events.  Will cause
   * all other listeners, as well as default keyboard input, to stop receiving
   * input until the retunred `dispose` method is called.
   * @param listener The listener to be notified on typing events
   * @returns A disposable that can be called to remove the listener
   */
  pushListener(listener: Listener): Disposable {
    this.isActivated = true;

    let isDisposed = false;

    const disposable = {
      dispose: () => {
        if (isDisposed) {
          return;
        }

        isDisposed = true;
        pull(this.listeners, listenerEntry);
        this.ensureState();
      },
    };

    const listenerEntry = { listener, disposable };

    this.listeners.push(listenerEntry);

    this.ensureState();

    return disposable;
  }

  cancelActiveListener(): void {
    if (this.activeListener == null) {
      return;
    }

    const { listener, disposable } = this.activeListener;

    listener.handleCancelled();
    disposable.dispose();
  }

  awaitSingleKeypress(
    displayOptions: DisplayOptions,
  ): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
      const disposable = this.pushListener({
        displayOptions,

        async handleInput(text: string) {
          disposable.dispose();
          resolve(text);
        },

        handleCancelled() {
          resolve(undefined);
        },
      });
    });
  }

  private ensureState() {
    const activeListener =
      this.listeners.length === 0
        ? undefined
        : this.listeners[this.listeners.length - 1];

    if (this.activeListener?.listener === activeListener) {
      return;
    }

    this.disposeOfActiveListener();
    this.activateListener(activeListener);

    this.ensureCursorStyle();
    this.ensureStatusBarText();
    this.ensureGlobalWhenClauseContext();
  }

  private activateListener(listenerEntry: ListenerEntry | undefined): void {
    if (listenerEntry == null) {
      return;
    }

    const {
      handleInput,
      displayOptions: { whenClauseContext },
    } = listenerEntry.listener;

    this.typeCommandDisposable = vscode.commands.registerCommand(
      "type",
      async ({ text }: TypeCommandArg) => {
        if (!vscode.window.activeTextEditor) {
          return;
        }

        await handleInput(text);
      },
    );
    this.disposables.push(this.typeCommandDisposable);

    if (whenClauseContext != null) {
      vscode.commands.executeCommand("setContext", whenClauseContext, true);
    }

    this.activeListener = listenerEntry;
  }

  private disposeOfActiveListener() {
    if (this.activeListener == null) {
      return;
    }

    this.typeCommandDisposable!.dispose();
    pull(this.disposables, this.typeCommandDisposable);
    this.typeCommandDisposable = undefined;

    const { whenClauseContext } = this.activeListener.listener.displayOptions;

    if (whenClauseContext != null) {
      vscode.commands.executeCommand("setContext", whenClauseContext, false);
    }

    this.activeListener = undefined;
  }

  private ensureCursorStyle() {
    if (!this.isActivated || !vscode.window.activeTextEditor) {
      return;
    }

    const cursorStyle =
      this.activeListener?.listener.displayOptions.cursorStyle ??
      vscode.TextEditorCursorStyle.Line;

    const currentCursorStyle =
      vscode.window.activeTextEditor.options.cursorStyle;

    if (currentCursorStyle !== cursorStyle) {
      vscode.window.activeTextEditor.options = {
        cursorStyle,
      };
    }
  }

  private ensureStatusBarText() {
    if (!this.isActivated) {
      return;
    }

    const statusBarText =
      this.activeListener?.listener.displayOptions.statusBarText;

    if (statusBarText == null) {
      this.graph.statusBarItem.unsetText();
    } else {
      this.graph.statusBarItem.setText(statusBarText);
    }
  }

  private ensureGlobalWhenClauseContext() {
    vscode.commands.executeCommand(
      "setContext",
      GLOBAL_WHEN_CLAUSE_CONTEXT,
      this.activeListener != null,
    );
  }
}
