/**
 * A map that can use a composite key, i.e. a key that is an array or object.
 * The key is hashed by running {@link hashFunction}, which is expected to
 * output a list whose entries can be converted to string.
 *
 * Based on https://stackoverflow.com/a/54523103
 */
export class CompositeKeyMap<K, V> {
  private map = new Map<string, V>();

  /**
   *
   * @param hashFunction A function that maps from a key to a list whose entries can be converted to string
   */
  constructor(private hashFunction: (key: K) => unknown[]) {}

  private hash(key: K): string {
    return this.hashFunction(key).join("\u0000");
  }

  set(key: K, item: V): this {
    this.map.set(this.hash(key), item);
    return this;
  }

  has(key: K): boolean {
    return this.map.has(this.hash(key));
  }

  get(key: K): V | undefined {
    return this.map.get(this.hash(key));
  }

  delete(key: K): this {
    this.map.delete(this.hash(key));
    return this;
  }

  clear(): this {
    this.map.clear();
    return this;
  }
}
