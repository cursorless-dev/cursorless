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
