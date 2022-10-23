import { State, StateKey, STATE_KEYS } from "../../../../ide/ide.types";

export default class FakeGlobalState implements State {
  private readonly data: Map<string, any> = new Map();

  get<T>(key: StateKey): T {
    return this.data.has(key) ? this.data.get(key) : STATE_KEYS[key];
  }

  set(key: StateKey, value: any): Thenable<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }
}
