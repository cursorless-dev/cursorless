import { Listener } from "../../util/Notifier";
import { HatRange, Hats, HatStyleMap } from "../types/Hats";
import { Disposable } from "../types/ide.types";

export class FakeHats implements Hats {
  setHatRanges(_hatRanges: HatRange[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  enabledHatStyles: HatStyleMap = {};
  onDidChangeEnabledHatStyles(_listener: Listener<[HatStyleMap]>): Disposable {
    throw new Error("Method not implemented.");
  }

  isEnabled: boolean = false;
  onDidChangeIsEnabled(_listener: Listener<[boolean]>): Disposable {
    throw new Error("Method not implemented.");
  }
}
