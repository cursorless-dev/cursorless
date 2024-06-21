import {
  HatRange,
  Hats,
  HatStyleMap,
  Listener,
  Notifier,
} from "@cursorless/common";
import { Disposable } from "vscode";
import type { NeovimIDE } from "../NeovimIDE";

export class NeovimHats implements Hats {
  enabledHatStyles: HatStyleMap;
  isEnabled: boolean;
  private enabledHatStyleNotifier: Notifier<[HatStyleMap]> = new Notifier();
  private isEnabledNotifier: Notifier<[boolean]> = new Notifier();

  constructor(private ide: NeovimIDE) {
    this.enabledHatStyles = {};
    // We don't support hats yet
    this.isEnabled = false;
  }

  async init() {}

  async setHatRanges(hatRanges: HatRange[]): Promise<void> {}

  onDidChangeEnabledHatStyles(listener: Listener<[HatStyleMap]>): Disposable {
    return this.enabledHatStyleNotifier.registerListener(listener);
  }

  onDidChangeIsEnabled(listener: Listener<[boolean]>): Disposable {
    return this.isEnabledNotifier.registerListener(listener);
  }
}

function dummyEvent() {
  return {
    [Symbol.dispose]() {
      // empty
    },
  };
}
