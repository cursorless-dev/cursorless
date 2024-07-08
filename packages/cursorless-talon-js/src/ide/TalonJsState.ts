import type { State, StateData, StateKey } from "@cursorless/common";

export class TalonJsState implements State {
  get<K extends StateKey>(_key: K): StateData[K] {
    throw new Error("state.get not implemented.");
  }

  async set<K extends StateKey>(_key: K, _value: StateData[K]): Promise<void> {
    throw new Error("state.set not implemented.");
  }
}
