import { ExtensionContext } from "vscode";
import { globalStateKeys } from "../../util/globalStateKeys";
import { State } from "../ide.types";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark these keys for synchronization
    extensionContext.globalState.setKeysForSync([
      globalStateKeys.hideInferenceWarning,
    ]);
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.extensionContext.globalState.get(key, defaultValue);
  }

  set(key: string, value: any): Thenable<void> {
    return this.extensionContext.globalState.update(key, value);
  }
}
