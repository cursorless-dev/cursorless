import type { State, StateData, StateKey } from "@cursorless/common";
import { STATE_DEFAULTS } from "@cursorless/common";

export default class NeovimGlobalState implements State {
  private readonly data: StateData = { ...STATE_DEFAULTS };

  get<K extends StateKey>(key: K): StateData[K] {
    return this.data[key];
  }

  set<K extends StateKey>(key: K, value: StateData[K]): Promise<void> {
    this.data[key] = value;
    return Promise.resolve();
  }
}
