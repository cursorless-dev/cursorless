import { TutorialId } from "../../types/tutorial.types";

interface SingleTutorialProgress {
  currentStep: number;
  version: number;
}

export type TutorialProgress = Partial<
  Record<TutorialId, SingleTutorialProgress>
>;

export interface StateData {
  hideInferenceWarning: boolean;
  tutorialProgress: TutorialProgress;
}
export type StateKey = keyof StateData;

/**
 * A mapping from allowable state keys to their default values
 */
export const STATE_DEFAULTS: StateData = {
  hideInferenceWarning: false,
  tutorialProgress: {},
};

/**
 * A state represents a storage utility. It can store and retrieve
 * values.
 */
export interface State {
  /**
   * Return a value.
   *
   * @param key A string.
   * @return The stored value or the defaultValue.
   */
  get<K extends StateKey>(key: K): StateData[K];

  /**
   * Store a value. The value must be JSON-stringifyable.
   *
   * @param key A string.
   * @param value A value. MUST not contain cyclic references.
   */
  set<K extends StateKey>(key: K, value: StateData[K]): Promise<void>;
}
