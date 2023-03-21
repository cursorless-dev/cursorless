import type { State, StateData, StateKey } from "../types/State";
import { STATE_DEFAULTS } from "../types/State";

export default class FakeGlobalState implements State {
  private readonly data: StateData = { ...STATE_DEFAULTS };

  get<K extends StateKey>(key: K): StateData[K] {
    return this.data[key];
  }

  set<K extends StateKey>(key: K, value: StateData[K]): Promise<void> {
    this.data[key] = value;
    return Promise.resolve();
  }
}
