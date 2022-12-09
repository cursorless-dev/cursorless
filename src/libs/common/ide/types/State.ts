/**
 * A mapping from allowable state keys to their default values
 */
export const STATE_KEYS = { hideInferenceWarning: false };
export type StateType = typeof STATE_KEYS;
export type StateKey = keyof StateType;

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
  get(key: StateKey): StateType[StateKey];

  /**
   * Store a value. The value must be JSON-stringifyable.
   *
   * @param key A string.
   * @param value A value. MUST not contain cyclic references.
   */
  set(key: StateKey, value: StateType[StateKey]): Thenable<void>;
}
