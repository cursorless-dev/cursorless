import { TutorialId } from "../../types/tutorial.types";

interface SingleTutorialProgress {
  currentStep: number;
  version: number;
}

export type TutorialProgress = Partial<
  Record<TutorialId, SingleTutorialProgress>
>;

export interface KeyValueStoreData {
  hideInferenceWarning: boolean;
  tutorialProgress: TutorialProgress;
}
export type KeyValueStoreKey = keyof KeyValueStoreData;

/**
 * A mapping from allowable key value store keys to their default values
 */
export const KEY_VALUE_STORE_DEFAULTS: KeyValueStoreData = {
  hideInferenceWarning: false,
  tutorialProgress: {},
};

/**
 * Represents a key/value storage utility. It can store and retrieve values.
 */
export interface KeyValueStore {
  /**
   * Return a value.
   *
   * @param key A string.
   * @return The stored value or the defaultValue.
   */
  get<K extends KeyValueStoreKey>(key: K): KeyValueStoreData[K];

  /**
   * Store a value. The value must be JSON-stringifyable.
   *
   * @param key A string.
   * @param value A value. MUST not contain cyclic references.
   */
  set<K extends KeyValueStoreKey>(
    key: K,
    value: KeyValueStoreData[K],
  ): Promise<void>;
}
