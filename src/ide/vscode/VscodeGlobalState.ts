import { ExtensionContext } from "vscode";
import { State, StateKey, STATE_KEYS } from "../ide.types";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark these keys for synchronization
    extensionContext.globalState.setKeysForSync(Object.keys(STATE_KEYS));
  }

  get<T>(key: StateKey): T {
    return this.extensionContext.globalState.get(key, STATE_KEYS[key] as T);
  }

  set(key: StateKey, value: any): Thenable<void> {
    return this.extensionContext.globalState.update(key, value);
  }
}
