import type { ExtensionContext } from "vscode";
import type { State, StateData, StateKey } from "@cursorless/common";
import { STATE_DEFAULTS } from "@cursorless/common";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync(Object.keys(STATE_DEFAULTS));
  }

  get<K extends StateKey>(key: K): StateData[K] {
    return this.extensionContext.globalState.get(key, STATE_DEFAULTS[key]);
  }

  async set<K extends StateKey>(key: K, value: StateData[K]): Promise<void> {
    return await this.extensionContext.globalState.update(key, value);
  }
}
