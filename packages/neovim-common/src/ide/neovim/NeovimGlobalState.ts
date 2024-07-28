import type { Storage, StorageData, StorageKey } from "@cursorless/common";
import { STORAGE_DEFAULTS } from "@cursorless/common";

export default class NeovimStorage implements Storage {
  private readonly data: StorageData = { ...STORAGE_DEFAULTS };

  get<K extends StorageKey>(key: K): StorageData[K] {
    return this.data[key];
  }

  set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void> {
    this.data[key] = value;
    return Promise.resolve();
  }
}
