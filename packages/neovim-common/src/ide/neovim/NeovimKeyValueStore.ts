import type {
  KeyValueStore,
  KeyValueStoreData,
  KeyValueStoreKey,
} from "@cursorless/common";
import { STORAGE_DEFAULTS } from "@cursorless/common";

export default class NeovimKeyValueStore implements KeyValueStore {
  private readonly data: KeyValueStoreData = { ...STORAGE_DEFAULTS };

  get<K extends KeyValueStoreKey>(key: K): KeyValueStoreData[K] {
    return this.data[key];
  }

  set<K extends KeyValueStoreKey>(
    key: K,
    value: KeyValueStoreData[K],
  ): Promise<void> {
    this.data[key] = value;
    return Promise.resolve();
  }
}
