import { pull } from "lodash";
import type { Disposable } from "../ide/types/ide.types";

type Arr = readonly unknown[];

export type Listener<T extends Arr = []> = (...args: [...T]) => void;

export class Notifier<T extends Arr = []> {
  private listeners: Listener<T>[] = [];

  constructor() {
    this.registerListener = this.registerListener.bind(this);
  }

  /**
   * Notify all listeners that something has changed
   */
  notifyListeners = (...args: [...T]): void => {
    this.listeners.forEach((listener) => listener(...args));
  };

  /**
   * Register to be notified when {@link notifyListeners} is called
   * @param listener A function to be called when {@link notifyListeners} is called
   * @returns A function that can be called to unsubscribe from notifications
   */
  registerListener(listener: Listener<T>): Disposable {
    this.listeners.push(listener);

    return {
      dispose: () => {
        pull(this.listeners, listener);
      },
    };
  }
}
