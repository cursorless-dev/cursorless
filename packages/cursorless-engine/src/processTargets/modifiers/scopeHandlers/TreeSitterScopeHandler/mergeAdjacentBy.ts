/**
 * Merges adjacent elements of a list using a predicate and a merge function.
 * Adjacent elements are merged if the predicate returns true for them.
 * @param input The input list to merge adjacent elements of
 * @param isEqual A function that returns true if two elements should be merged
 * @param merge A function that merges multiple elements
 * @returns A new list with adjacent elements merged
 */
export function mergeAdjacentBy<T>(
  input: T[],
  isEqual: (a: T, b: T) => boolean,
  merge: (a: T[]) => T,
): T[] {
  const result: T[] = [];
  let current: T[] = [];

  for (const elem of input) {
    if (current.length === 0 || isEqual(current[current.length - 1], elem)) {
      current.push(elem);
    } else {
      result.push(merge(current));
      current = [elem];
    }
  }

  if (current.length > 0) {
    result.push(merge(current));
  }

  return result;
}
