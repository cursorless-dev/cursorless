export function getDefault<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  let currentValue = map.get(key);

  if (currentValue == null) {
    currentValue = factory();
    map.set(key, currentValue);
  }

  return currentValue;
}
