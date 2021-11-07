/**
 * Returns value at key in map, creating it using factory if it doesn't exist.
 * Behaves a bit like Python defaultdicts.
 * @param map The map to check / update
 * @param key The key to look for
 * @param factory A factory used to construct missing values
 * @returns The existing value, or the new one if constructed
 */
export function getDefault<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  let currentValue = map.get(key);

  if (currentValue == null) {
    currentValue = factory();
    map.set(key, currentValue);
  }

  return currentValue;
}
