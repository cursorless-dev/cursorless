import type {
  KeyValueStore,
  KeyValueStoreData,
  KeyValueStoreKey,
} from "@cursorless/common";
import { KEY_VALUE_STORE_DEFAULTS } from "@cursorless/common";
import type { ExtensionContext } from "vscode";
import { VERSION_KEY } from "../../ReleaseNotes";
import { DONT_SHOW_TALON_UPDATE_MESSAGE_KEY } from "../../ScopeTreeProvider";
import { PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY } from "./hats/performPr1868ShapeUpdateInit";

export default class VscodeKeyValueStore implements KeyValueStore {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync([
      ...Object.keys(KEY_VALUE_STORE_DEFAULTS),
      VERSION_KEY,
      PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY,
      DONT_SHOW_TALON_UPDATE_MESSAGE_KEY,
    ]);
  }

  get<K extends KeyValueStoreKey>(key: K): KeyValueStoreData[K] {
    return this.extensionContext.globalState.get(
      key,
      KEY_VALUE_STORE_DEFAULTS[key],
    );
  }

  async set<K extends KeyValueStoreKey>(
    key: K,
    value: KeyValueStoreData[K],
  ): Promise<void> {
    return await this.extensionContext.globalState.update(key, value);
  }
}
