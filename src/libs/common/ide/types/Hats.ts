import { Range } from "../../types/Range";
import { TextEditor } from "../../types/TextEditor";
import { Listener } from "../../util/Notifier";
import type { HatStyleName } from "./hatStyles.types";
import { Disposable } from "./ide.types";

export interface HatRange {
  styleName: HatStyleName;
  editor: TextEditor;
  range: Range;
}

export interface HatStyleInfo {
  /**
   * The penalty for this hat style.  The lower the penalty, the better the hat.
   * It is recommended to have a penalty associated with each style component
   * (eg color, shape, etc), corresponding to how many syllables are required to
   * utter the given style component.  As each style is a combination of 0 or
   * more components, the total penalty for a style is the sum of the penalties
   * of its components.
   */
  penalty: number;
}

/**
 * Mapping from available hat styles to their priorities
 */
export type HatStyleMap = Record<HatStyleName, HatStyleInfo>;

/**
 * Provides an interface for indicating where hats should be rendered in the ide
 */
export interface Hats {
  /**
   * Set which ranges each hat should have
   * @param hatRanges The ranges that all hats should have
   */
  setHatRanges(hatRanges: HatRange[]): Promise<void>;

  /**
   * Mapping from enabled hat styles to their penalties.  Each hat style
   * represents a combination of hat style components (eg color, shape, etc).
   * So a hat style might be "green-curve".
   */
  readonly enabledHatStyles: HatStyleMap;
  onDidChangeEnabledHatStyles(listener: Listener<[HatStyleMap]>): Disposable;

  /**
   * Whether hats are enabled.  This can be determined by a setting, a toggle
   * command, or both.
   */
  readonly isEnabled: boolean;
  onDidChangeIsEnabled(listener: Listener<[boolean]>): Disposable;
}
