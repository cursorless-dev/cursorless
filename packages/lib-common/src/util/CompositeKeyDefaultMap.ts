/**
 * A map that uses a composite key to store values. If a value is not found for
 * a given key, the default value is returned.
 */
export class CompositeKeyDefaultMap<K, V> {
  private map = new Map<string, V>();

  constructor(
    private getDefaultValue: (key: K) => V,
    private hashFunction: (key: K) => unknown[],
  ) {}

  hash(key: K): string {
    return this.hashFunction(key).join("\u0000");
  }

  get(key: K): V {
    const stringKey = this.hash(key);
    const currentValue = this.map.get(stringKey);

    if (currentValue != null) {
      return currentValue;
    }

    const value = this.getDefaultValue(key);
    this.map.set(stringKey, value);

    return value;
  }

  entries(): IterableIterator<[string, V]> {
    return this.map.entries();
  }

  values(): IterableIterator<V> {
    return this.map.values();
  }
}
