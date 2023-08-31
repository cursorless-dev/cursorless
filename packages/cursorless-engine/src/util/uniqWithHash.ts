import { uniqWith } from "lodash";

/**
 * Like lodash.uniqWith, but uses a hash function to (mostly) avoid quadratic runtime.
 * @param array The array to uniq
 * @param isEqual The equality function
 * @param hash The hash function. It must be a valid hash function, insofar as it must return the same value for equal items. A hash function that returns a constant value is equivalent to lodash.uniqWith.
 * @returns The uniq array
 */
export function uniqWithHash<T>(
  array: T[],
  isEqual: (a: T, b: T) => boolean,
  hash: (t: T) => string,
): T[] {
  // Handle the common, tiny cases without allocating anything extra.
  if (array.length < 2) {
    return [...array];
  }
  if (array.length === 2) {
    if (isEqual(array[0], array[1])) {
      return [array[0]];
    }
    return [...array];
  }
  // First, split up the array using the hash function.
  // This keeps the sets of items passed to uniqWith small,
  // so that the quadratic runtime of uniqWith less of a problem.

  /* Keep track of which sets have multiple items, so that we can uniq them. */
  const needsUniq: string[] = [];
  const hashToItems: Map<string, T[]> = array.reduce((acc, item) => {
    const key = hash(item);
    const items = acc.get(key);
    if (items == null) {
      acc.set(key, [item]);
      return acc;
    }

    acc.get(key)!.push(item);
    if (items.length === 2) {
      needsUniq.push(key);
    }
    return acc;
  }, new Map<string, T[]>());

  // For hash collisions, uniq the items,
  // letting uniqWith provide correct semantics.
  needsUniq.forEach((key) => {
    hashToItems.set(key, uniqWith(hashToItems.get(key)!, isEqual));
  });

  // Another common case: Everything is unique.
  if (needsUniq.length === 0) {
    return [...array];
  }

  // To preserve order, step through the original items
  // one at a time, returning it as appropriate.
  // We need to do this because uniqWith preserves order,
  // and we are mimicking its semantics.
  // Note that items were added in order,
  // and uniqWith preserved that order.
  return array.flatMap((item) => {
    const key = hash(item);
    const items = hashToItems.get(key)!;
    if (items == null || items.length === 0) {
      // Removed by uniqWith.
      return [];
    }
    const first = items[0]!;
    if (!isEqual(first, item)) {
      // Removed by uniqWith.
      return [];
    }
    // Emit item.
    items.shift();
    return first;
  });
}
