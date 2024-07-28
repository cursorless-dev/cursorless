import { TutorialId } from "../../types/tutorial.types";

interface SingleTutorialProgress {
  currentStep: number;
  version: number;
}

export type TutorialProgress = Partial<
  Record<TutorialId, SingleTutorialProgress>
>;

export interface StorageData {
  hideInferenceWarning: boolean;
  tutorialProgress: TutorialProgress;
}
export type StorageKey = keyof StorageData;

/**
 * A mapping from allowable storage keys to their default values
 */
export const STORAGE_DEFAULTS: StorageData = {
  hideInferenceWarning: false,
  tutorialProgress: {},
};

/**
 * Represents a storage utility. It can store and retrieve values.
 */
export interface Storage {
  /**
   * Return a value.
   *
   * @param key A string.
   * @return The stored value or the defaultValue.
   */
  get<K extends StorageKey>(key: K): StorageData[K];

  /**
   * Store a value. The value must be JSON-stringifyable.
   *
   * @param key A string.
   * @param value A value. MUST not contain cyclic references.
   */
  set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void>;
}
