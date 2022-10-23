import { ExtensionContext } from "vscode";
import { State, StateKey, STATE_KEYS } from "../ide.types";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark these keys for synchronization
    extensionContext.globalState.setKeysForSync(STATE_KEYS);
  }

  get<T>(key: StateKey, defaultValue?: T): T | undefined {
    return this.extensionContext.globalState.get(key, defaultValue);
  }

  set(key: StateKey, value: any): Thenable<void> {
    return this.extensionContext.globalState.update(key, value);
  }
}
