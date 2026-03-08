import type {
  KeyValueStore,
  KeyValueStoreData,
  KeyValueStoreKey,
} from "@cursorless/common";

export class TalonJsKeyValueStore implements KeyValueStore {
  get<K extends KeyValueStoreKey>(_key: K): KeyValueStoreData[K] {
    throw new Error("state.get not implemented.");
  }

  async set<K extends KeyValueStoreKey>(
    _key: K,
    _value: KeyValueStoreData[K],
  ): Promise<void> {
    throw new Error("state.set not implemented.");
  }
}
