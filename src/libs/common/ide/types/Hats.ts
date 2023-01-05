import { Disposable } from "vscode";
import type { TextEditorRange } from "../../types/location.types";
import { Listener } from "../../util/Notifier";
import type { HatStyleName } from "./hatStyles.types";

export type HatRanges = Record<HatStyleName, readonly TextEditorRange[]>;

export interface HatStyleInfo {
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
  setHatRanges(hatRanges: HatRanges): Promise<void>;

  /**
   * Mapping from available hat styles to their priorities
   */
  readonly availableHatStyles: HatStyleMap;
  onDidChangeAvailableHatStyles(listener: Listener<[HatStyleMap]>): Disposable;

  /**
   * Whether hats should be active
   */
  readonly isActive: boolean;
  onDidChangeIsActive(listener: Listener<[boolean]>): Disposable;
}
