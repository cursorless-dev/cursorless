import { ExtensionContext } from "vscode";
import { State, StateKey, StateType, STATE_KEYS } from "../ide.types";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync(Object.keys(STATE_KEYS));
  }

  get(key: StateKey): StateType[StateKey] {
    return this.extensionContext.globalState.get(key) ?? STATE_KEYS[key];
  }

  set(key: StateKey, value: StateType[StateKey]): Thenable<void> {
    return this.extensionContext.globalState.update(key, value);
  }
}
