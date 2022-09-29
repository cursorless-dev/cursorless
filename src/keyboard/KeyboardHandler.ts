import { pull } from "lodash";
import * as vscode from "vscode";
import { Disposable } from "vscode";
import { Graph } from "../typings/Types";

interface Listener {
  handleInput(text: string): void;
}

interface ActiveListener {
  listener: Listener;
  typeCommandDisposable: Disposable;
}

interface TypeCommandArg {
  text: string;
}

/**
 * Allows other components to register to listen to typing events.  Note that
 * only one listener can be active at a time, and having any listeners active
 * will cause typing not to work.
 */
export default class KeyboardHandler {
  private listeners: Listener[] = [];
  private activeListener: ActiveListener | undefined;

  constructor(private graph: Graph) {}

  /**
   * Registers a listener to take over listening to typing events.  Will cause
   * all other listeners, as well as default keyboard input, to stop receiving
   * input until the retunred `dispose` method is called.
   * @param listener The listener to be notified on typing events
   * @returns A disposable that can be called to remove the listener
   */
  pushListener(listener: Listener): Disposable {
    this.listeners.push(listener);
    this.ensureListenerState();

    return {
      dispose: () => {
        pull(this.listeners, listener);
        this.ensureListenerState();
      },
    };
  }

  awaitSingleKeypress(): Promise<string> {
    return new Promise<string>((resolve) => {
      const disposable = this.pushListener({
        handleInput(text: string) {
          disposable.dispose();
          resolve(text);
        },
      });
    });
  }

  private ensureListenerState() {
    if (this.listeners.length === 0) {
      this.disposeOfActiveListener();
      return;
    }

    const activeListener = this.listeners[this.listeners.length - 1];

    if (this.activeListener?.listener === activeListener) {
      return;
    }

    this.activateListener(activeListener);
  }

  private activateListener(listener: Listener): void {
    this.disposeOfActiveListener();

    const typeCommandDisposable = vscode.commands.registerCommand(
      "type",
      ({ text }: TypeCommandArg) => {
        if (!vscode.window.activeTextEditor) {
          return;
        }

        listener.handleInput(text);
      }
    );
    this.graph.extensionContext.subscriptions.push(typeCommandDisposable);

    this.activeListener = { listener, typeCommandDisposable };
  }

  private disposeOfActiveListener() {
    if (this.activeListener == null) {
      return;
    }

    this.activeListener.typeCommandDisposable.dispose();
    pull(
      this.graph.extensionContext.subscriptions,
      this.activeListener.typeCommandDisposable
    );
    this.activeListener = undefined;
  }
}
