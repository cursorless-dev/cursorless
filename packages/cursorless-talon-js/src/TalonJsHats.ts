import type {
  Disposable,
  HatRange,
  HatStyleMap,
  Hats,
  Listener,
} from "@cursorless/common";

export class TalonJsHats implements Hats {
  isEnabled = false;
  enabledHatStyles: HatStyleMap = {};

  setHatRanges(_hatRanges: HatRange[]): Promise<void> {
    throw new Error("setHatRanges not implemented.");
  }

  onDidChangeEnabledHatStyles(_listener: Listener<[HatStyleMap]>): Disposable {
    throw new Error("onDidChangeEnabledHatStyles not implemented.");
  }

  onDidChangeIsEnabled(_listener: Listener<[boolean]>): Disposable {
    throw new Error("onDidChangeIsEnabled not implemented.");
  }
}
