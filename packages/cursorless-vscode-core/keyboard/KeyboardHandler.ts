import { pull } from "lodash";
import * as vscode from "vscode";
import { Disposable } from "vscode";
import { StatusBarItem } from "../StatusBarItem";

/**
 * This when clause context is active if any Cursorless listener is in control
 * of the keyboard
 */
const GLOBAL_WHEN_CLAUSE_CONTEXT = "cursorless.keyboard.listening";

/**
 * Describes a keyboard listener
 */
interface Listener {
  /**
   * How to indicate to the user that the listener is active
   */
  displayOptions: DisplayOptions;

  /**
   * This function will be called anytime the user presses a key while this
   * listener is active
   * @param text The key pressed
   */
  handleInput(text: string): Promise<unknown>;

  /**
   * This function will be called if the listener is canceled (eg if the user
   * has `cursorless.keyboard.escape` bound to `escape` and they press
   * `escape`)
   */
  handleCancelled(): void;
}

/**
 * How to indicate to the user that the listener is active
 */
interface DisplayOptions {
  /**
   * The cursor style to show to the user while this listener is active
   */
  cursorStyle: vscode.TextEditorCursorStyle;

  /**
   * The
   * {@link https://code.visualstudio.com/api/references/when-clause-contexts when clause context}
   * to activate while this listener is active
   */
  whenClauseContext?: string;

  /**
   * The status bar text to display while this listener is active
   */
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
 *
 * Each time {@link pushListener} is called, the listener is pushed onto the top
 * of the stack.  The `cursorless.keyboard.escape` action can be used to pop the
 * current listener off the stack, which will call its
 * {@link Listener.handleCancelled} function.  The next listener on the stack
 * will take over the keyboard, unless the stack is empty, which will give
 * keyboard control back to VSCode.
 */
export default class KeyboardHandler {
  private listeners: ListenerEntry[] = [];
  private activeListener: ListenerEntry | undefined;
  private typeCommandDisposable?: Disposable;
  private isActivated = false;
  private disposables: Disposable[] = [];

  constructor(
    extensionContext: vscode.ExtensionContext,
    private statusBarItem: StatusBarItem,
  ) {
    this.cancelActiveListener = this.cancelActiveListener.bind(this);
    extensionContext.subscriptions.push(this);
  }

  init() {
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((textEditor) => {
        if (!textEditor) {
          return;
        }

        /**
         * Indicates that Cursorless should not force cursor to
         * {@link TextEditorCursorStyle.Line} when it is not listening.  Users
         * should set this if they're using something like VSCode vim plugin.
         */
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
   * input until the returned `dispose` method is called.
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

  /**
   * Pop active listener of the stack and call its
   * {@link Listener.handleCancelled} function
   */
  cancelActiveListener(): void {
    if (this.activeListener == null) {
      return;
    }

    const { listener, disposable } = this.activeListener;

    listener.handleCancelled();
    disposable.dispose();
  }

  /**
   * Convenience method that can be used to wait for a single keypress.
   * @param displayOptions How to indicate that this listener is active (eg
   * cursor)
   * @returns A promise that resolves to the next key pressed by the user, or
   * `undefined` if {@link cancelActiveListener} is called before a keypress (eg
   * if they have `cursorless.keyboard.escape` bound to `escape` and they press
   * `escape`)
   */
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

  /**
   * Called after any input state changes (eg listener pushed), and ensures that
   * the state that we control is as expected.  Eg it changes cursor if
   * necessary, sets when clause contexts, etc
   */
  private ensureState() {
    const activeListener =
      this.listeners.length === 0
        ? undefined
        : this.listeners[this.listeners.length - 1];

    if (this.activeListener?.listener === activeListener) {
      // If nothing has changed, do nothing
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

    // Register to receive typing events instead of main VSCode response.  This
    // is where we take control of the keyboard FIXME: We could probably just do
    // this when stack goes from empty to non-empty, rather than registering /
    // deregistering every time another listener pops onto stack
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
      this.statusBarItem.unsetText();
    } else {
      this.statusBarItem.setText(statusBarText);
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
