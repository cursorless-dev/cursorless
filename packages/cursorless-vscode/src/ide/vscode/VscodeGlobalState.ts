import type { State, StateData, StateKey } from "@cursorless/common";
import { STATE_DEFAULTS } from "@cursorless/common";
import type { ExtensionContext } from "vscode";
import { VERSION_KEY } from "../../ReleaseNotes";
import { DONT_SHOW_TALON_UPDATE_MESSAGE_KEY } from "../../ScopeTreeProvider";
import { PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY } from "./hats/performPr1868ShapeUpdateInit";

export default class VscodeGlobalState implements State {
  constructor(private extensionContext: ExtensionContext) {
    // Mark all keys for synchronization
    extensionContext.globalState.setKeysForSync([
      ...Object.keys(STATE_DEFAULTS),
      VERSION_KEY,
      PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY,
      DONT_SHOW_TALON_UPDATE_MESSAGE_KEY,
    ]);
  }

  get<K extends StateKey>(key: K): StateData[K] {
    return this.extensionContext.globalState.get(key, STATE_DEFAULTS[key]);
  }

  async set<K extends StateKey>(key: K, value: StateData[K]): Promise<void> {
    return await this.extensionContext.globalState.update(key, value);
  }
}
