import type { ExtensionContext } from "vscode";
import type {
  State,
  StateData,
  StateKey,
} from "../../packages/common/ide/types/State";
import { STATE_DEFAULTS } from "../../packages/common/ide/types/State";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync(Object.keys(STATE_DEFAULTS));
  }

  get<K extends StateKey>(key: K): StateData[K] {
    return this.extensionContext.globalState.get(key, STATE_DEFAULTS[key]);
  }

  set<K extends StateKey>(key: K, value: StateData[K]): Thenable<void> {
    return this.extensionContext.globalState.update(key, value);
  }
}
