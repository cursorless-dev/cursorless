import type {
  KeyValueStore,
  KeyValueStoreData,
  KeyValueStoreKey,
} from "../types/KeyValueStore";
import { KEY_VALUE_STORE_DEFAULTS } from "../types/KeyValueStore";

export default class FakeKeyValueStore implements KeyValueStore {
  private readonly data: KeyValueStoreData = { ...KEY_VALUE_STORE_DEFAULTS };

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
