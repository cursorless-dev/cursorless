import { uniqWith, isEqual } from "lodash";

/**
 * Like lodash.uniqWith, but uses a hash function to (mostly) avoid quadratic runtime.
 * @param array The array to uniq
 * @param fn The equality function
 * @param hash The hash function. It must be a valid hash function, insofar as it must return the same value for equal items. A hash function that returns a constant value is equivalent to lodash.uniqWith.
 * @returns The uniq array
 */
export function uniqWithHash<T>(
  array: T[],
  fn: (a: T, b: T) => boolean,
  hash: (t: T) => string,
): T[] {
  // First, split up the array using the hash function.
  // This keeps the sets of items passed to uniqWith small,
  // so that the quadratic runtime of uniqWith less of a problem.
  // Keep track of which sets have multiple items, so that we can uniq them.
  const needsUniq: string[] = [];
  const hashToItems: Map<string, T[]> = array.reduce((acc, item) => {
    const key = hash(item);
    const items = acc.get(key);
    if (items == null) {
      acc.set(key, [item]);
      return acc;
    }
    if (items.length === 1) {
      needsUniq.push(key);
    }
    acc.get(key)!.push(item);
    return acc;
  }, new Map<string, T[]>());

  // For hash collisions, uniq the items,
  // letting uniqWith provide correct semantics.
  needsUniq.forEach((key) => {
    hashToItems.set(key, uniqWith(hashToItems.get(key)!, fn));
  });

  // To preserve order, step through the original items
  // one at a time, returning it as appropriate.
  return array.flatMap((item) => {
    const key = hash(item);
    const items = hashToItems.get(key)!;
    if (items == null || items.length === 0) {
      // Removed by uniqWith.
      return [];
    }
    const first = items[0]!;
    if (!isEqual(first, item)) {
      // Not our turn yet.
      return [];
    }
    // Emit item.
    items.shift();
    hashToItems.set(key, items);
    return first;
  });
}
