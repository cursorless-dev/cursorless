function maxByAll<T>(arr: T[], fn: (item: T) => number): T[] {
  const max = Math.max(...arr.map(fn).filter((item) => !isNaN(item)));
  return arr.filter((item) => fn(item) === max);
}

/**
 * Given an array of items and a list of functions that return a number for each
 * item, return the item that has the maximum value according to the
 * mathematical lexicographic order.  Ie, first narrows down to items that share
 * the maximum value for the first function, then of those remaining, narrows
 * down to those that have the maximum value for the second, etc.  Whenever
 * there is only 1 item remaining, that item is returned.  If every item is
 * eliminated, undefined is returned.
 *
 * Whenever a function returns NaN for an item, that item is removed.
 *
 * @example maxByMultiple([{a: 1, b: 1}, {a: 1, b: 2}], [({a}) => a, ({b}) =>
 * b]) === {a: 1, b: 2}
 *
 * @param arr The array to find the max value of
 * @param fns A list of functions that return a number for each item in the
 * array
 * @returns The item in the array that has the maximum value, or undefined if
 * array is empty or all items are removed
 */
export function maxByMultiple<T>(
  arr: T[],
  fns: ((item: T) => number)[],
): T | undefined {
  let remainingValues = arr;
  for (const fn of fns) {
    if (remainingValues.length === 1) {
      return remainingValues[0];
    }

    if (remainingValues.length === 0) {
      return undefined;
    }

    remainingValues = maxByAll(remainingValues, fn);
  }

  return remainingValues[0];
}
