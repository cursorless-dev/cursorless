import type { Storage, StorageData, StorageKey } from "../types/Storage";
import { STORAGE_DEFAULTS } from "../types/Storage";

export default class FakeStorage implements Storage {
  private readonly data: StorageData = { ...STORAGE_DEFAULTS };

  get<K extends StorageKey>(key: K): StorageData[K] {
    return this.data[key];
  }

  set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void> {
    this.data[key] = value;
    return Promise.resolve();
  }
}
