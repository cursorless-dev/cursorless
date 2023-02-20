/**
 * A map that returns a default value when a key is not found.
 *
 * Based on https://aaronmoat.com/implementing-pythons-defaultdict-in-javascript/
 */
export default class DefaultMap<K, V> extends Map<K, V> {
  /**
   * @param getDefaultValue A function that returns the default value for a given key
   */
  constructor(private getDefaultValue: (key: K) => V) {
    super();
  }

  get(key: K): V {
    const currentValue = super.get(key);

    if (currentValue != null) {
      return currentValue;
    }

    const value = this.getDefaultValue(key);
    this.set(key, value);

    return value;
  }
}
