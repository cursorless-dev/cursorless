// Based on https://aaronmoat.com/implementing-pythons-defaultdict-in-javascript/
export default class DefaultMap<K, V> extends Map<K, V> {
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
