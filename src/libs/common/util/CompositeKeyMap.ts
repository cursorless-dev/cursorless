// Based on https://stackoverflow.com/a/54523103
export default class CompositeKeyMap<K, V> {
  private map: Record<string, V> = {};

  /**
   *
   * @param hashFunction A function that maps from a key to a list whose entries can be converted to string
   */
  constructor(private hashFunction: (key: K) => unknown[]) {}

  private hash(key: K): string {
    return this.hashFunction(key).join("\u0000");
  }

  set(key: K, item: V): this {
    this.map[this.hash(key)] = item;
    return this;
  }

  has(key: K): boolean {
    return this.hash(key) in this.map;
  }

  get(key: K): V {
    return this.map[this.hash(key)];
  }

  delete(key: K): this {
    delete this.map[this.hash(key)];
    return this;
  }
}
