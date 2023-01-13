export function minByAll<T>(arr: T[], fn: (item: T) => number): T[] {
  const min = Math.min(...arr.map(fn));
  return arr.filter((item) => fn(item) === min);
}

export function maxByAll<T>(arr: T[], fn: (item: T) => number): T[] {
  const max = Math.max(...arr.map(fn));
  return arr.filter((item) => fn(item) === max);
}

export function maxByMultiple<T>(
  arr: T[],
  fns: ((item: T) => number)[],
): T | undefined {
  let remainingValues = arr;
  for (const fn of fns) {
    remainingValues = maxByAll(remainingValues, fn);

    if (remainingValues.length === 1) {
      return remainingValues[0];
    }
  }
  return remainingValues[0];
}
