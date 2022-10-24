import { ExtensionContext } from "vscode";
import { State, StateKey, STATE_KEYS } from "../ide.types";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync(Object.keys(STATE_KEYS));
  }

  get(key: StateKey): typeof STATE_KEYS[StateKey] {
    return this.extensionContext.globalState.get(key) ?? STATE_KEYS[key];
  }

  set(key: StateKey, value: typeof STATE_KEYS[StateKey]): Thenable<void> {
    return this.extensionContext.globalState.update(key, value);
  }
}
