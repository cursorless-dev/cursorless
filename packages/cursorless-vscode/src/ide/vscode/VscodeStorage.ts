import type { Storage, StorageData, StorageKey } from "@cursorless/common";
import { STORAGE_DEFAULTS } from "@cursorless/common";
import type { ExtensionContext } from "vscode";
import { VERSION_KEY } from "../../ReleaseNotes";
import { DONT_SHOW_TALON_UPDATE_MESSAGE_KEY } from "../../ScopeTreeProvider";
import { PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY } from "./hats/performPr1868ShapeUpdateInit";

export default class VscodeStorage implements Storage {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync([
      ...Object.keys(STORAGE_DEFAULTS),
      VERSION_KEY,
      PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY,
      DONT_SHOW_TALON_UPDATE_MESSAGE_KEY,
    ]);
  }

  get<K extends StorageKey>(key: K): StorageData[K] {
    return this.extensionContext.globalState.get(key, STORAGE_DEFAULTS[key]);
  }

  async set<K extends StorageKey>(
    key: K,
    value: StorageData[K],
  ): Promise<void> {
    return await this.extensionContext.globalState.update(key, value);
  }
}
