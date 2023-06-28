/**
 * Returns a map where the elements are grouped based on the value of `func` for
 * the given elements.
 * @param list LIst of elements to group
 * @param func Function to map elements to group key
 * @returns Map from group keys to list of elements mapped to given key
 */
export function groupBy<T, U>(list: T[], func: (element: T) => U): Map<U, T[]> {
  const map = new Map<U, T[]>();

  list.forEach((element) => {
    const key = func(element);
    let group: T[];

    if (map.has(key)) {
      group = map.get(key)!;
    } else {
      group = [];
      map.set(key, group);
    }

    group.push(element);
  });

  return map;
}

/**
 * Partitions a list into two lists, one containing all elements for which the
 * predicate returned `true`, the other containing all elements for which the
 * predicate returned `false`
 * @param list The list to partition
 * @param predicate The predicate to use to partition the list
 * @returns A tuple of two lists, the first containing all elements for which
 * the predicate returned `true`, the second containing all elements for which the
 * predicate returned `false`
 */
export function partition<T, U>(
  list: (T | U)[],
  predicate: (elem: T | U) => elem is T,
): [T[], U[]] {
  const first: T[] = [];
  const second: U[] = [];
  for (const elem of list) {
    if (predicate(elem)) {
      first.push(elem);
    } else {
      second.push(elem);
    }
  }
  return [first, second];
}

/**
 * Returns `true` if the given iterable is empty, `false` otherwise
 *
 * From https://github.com/sindresorhus/is-empty-iterable/blob/12d3b4f966170d9d85a2067f5326668d5bb910a0/index.js
 * @param iterable The iterable to check
 * @returns `true` if the iterable is empty, `false` otherwise
 */
export function isEmptyIterable(iterable: Iterable<unknown>): boolean {
  for (const _ of iterable) {
    // eslint-disable-line no-unused-vars, no-unreachable-loop
    return false;
  }

  return true;
}
