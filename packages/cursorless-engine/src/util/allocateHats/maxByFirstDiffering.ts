/**
 * Given an array of items and a list of functions that return a number for each
 * item, return the item that has the maximum value according to the
 * mathematical lexicographic order.  Ie, first narrows down to items that share
 * the maximum value for the first function, then of those remaining, narrows
 * down to those that have the maximum value for the second, etc.  Whenever
 * there is only 1 item remaining, that item is returned.  If the list is empty,
 * undefined is returned.
 *
 * @example maxByFirstDiffering([{a: 1, b: 1}, {a: 1, b: 2}], [({a}) => a, ({b}) =>
 * b]) === {a: 1, b: 2}
 *
 * @param arr The array to find the max value of
 * @param fns A list of functions that return a number for each item in the
 * array
 * @returns The item in the array that has the maximum value, or undefined if
 * array is empty or all items are removed
 */
export function maxByFirstDiffering<T>(
  arr: T[],
  fns: ((item: T) => number)[],
): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  let remainingValues = arr;
  for (const fn of fns) {
    if (remainingValues.length === 1) {
      return remainingValues[0];
    }
    remainingValues = maxByAllowingTies(remainingValues, fn);
  }
  return remainingValues[0];
}

/**
 * Given an array of items and a function that returns a number for each item,
 * return all items that share the maximum value according to that function.
 * @param arr The array to find the max values of
 * @param fn A function that returns a number for each item in the array
 * @returns All items in the array that share the maximum value
 **/
export function maxByAllowingTies<T>(arr: T[], fn: (item: T) => number): T[] {
  // This is equivalent to, but faster than:
  //
  // const max = Math.max(...arr.map(fn));
  // return arr.filter((item) => fn(item) === max);
  //
  // It does only a single pass through the array, and allocates no
  // intermediate arrays (in the common case).

  // Accumulate all items with the single highest value,
  // resetting whenever we find a new highest value.
  let best: number = -Infinity;
  const keep: T[] = [];
  for (const item of arr) {
    const value = fn(item);
    if (value < best) {
      continue;
    }
    if (value > best) {
      best = value;
      keep.length = 0;
    }
    keep.push(item);
  }
  return keep;
}
