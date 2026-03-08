import type {
  Disposable,
  HatRange,
  Hats,
  HatStyleMap,
  Listener,
} from "@cursorless/common";

const HAT_COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
] as const;

/**
 * This class is a mock implementation and only used for testing.
 * It uses the default colars and no extra shapes.
 */
export class TalonJsTestHats implements Hats {
  isEnabled = true;
  private hatRanges: HatRange[] = [];
  enabledHatStyles: HatStyleMap = Object.fromEntries(
    HAT_COLORS.map((color) => [
      color,
      { penalty: color === "default" ? 0 : 1 },
    ]),
  );

  async setHatRanges(hatRanges: HatRange[]): Promise<void> {
    this.hatRanges = hatRanges;
  }

  onDidChangeEnabledHatStyles(_listener: Listener<[HatStyleMap]>): Disposable {
    return { dispose: () => {} };
  }

  onDidChangeIsEnabled(_listener: Listener<[boolean]>): Disposable {
    return { dispose: () => {} };
  }
}
