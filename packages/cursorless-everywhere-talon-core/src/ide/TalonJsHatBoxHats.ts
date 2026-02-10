import type {
  Disposable,
  HatRange,
  Hats,
  HatStyleMap,
  Listener,
} from "@cursorless/common";
import type { Talon } from "../types/talon.types";

const HAT_COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
] as const;

const HAT_NON_DEFAULT_SHAPES = [
  "bolt",
  "curve",
  "fox",
  "frame",
  "play",
  "wing",
  "hole",
  "ex",
  "crosshairs",
  "eye",
] as const;

/**
 * Sends hat ranges to HatBox (a macOS overlay app) via a Talon Python action
 * that writes hat data to a JSON file for HatBox to read.
 *
 * Data is JSON.stringify'd on the JS side because TalonJS objects don't
 * auto-convert to Python dicts (they remain opaque JS Objects).
 */
export class TalonJsHatBoxHats implements Hats {
  isEnabled = true;
  enabledHatStyles: HatStyleMap = (() => {
    const styles: HatStyleMap = {};
    for (const color of HAT_COLORS) {
      // Default shape (color only)
      styles[color] = { penalty: color === "default" ? 0 : 1 };
      // Non-default shapes (color-shape)
      for (const shape of HAT_NON_DEFAULT_SHAPES) {
        styles[`${color}-${shape}`] = {
          penalty: color === "default" ? 1 : 2,
        };
      }
    }
    return styles;
  })();

  constructor(private talon: Talon) {}

  async setHatRanges(hatRanges: HatRange[]): Promise<void> {
    const data = hatRanges.map((hatRange) => {
      const startOffset = hatRange.editor.document.offsetAt(
        hatRange.range.start,
      );
      const endOffset = hatRange.editor.document.offsetAt(hatRange.range.end);
      const text = hatRange.editor.document.getText(hatRange.range);
      return {
        offset: startOffset,
        length: endOffset - startOffset,
        grapheme: text.charAt(0),
        styleName: hatRange.styleName,
      };
    });
    // Pass as JSON string — TalonJS objects aren't auto-converted to Python dicts
    this.talon.actions.user.cursorless_everywhere_set_hat_ranges(
      JSON.stringify(data),
    );
  }

  onDidChangeEnabledHatStyles(
    _listener: Listener<[HatStyleMap]>,
  ): Disposable {
    return { dispose: () => {} };
  }

  onDidChangeIsEnabled(_listener: Listener<[boolean]>): Disposable {
    return { dispose: () => {} };
  }
}
