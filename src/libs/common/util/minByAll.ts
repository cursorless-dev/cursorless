export function minByAll<T>(arr: T[], fn: (item: T) => number): T[] {
  const min = Math.min(...arr.map(fn));
  return arr.filter((item) => fn(item) === min);
}

export function maxByAll<T>(arr: T[], fn: (item: T) => number): T[] {
  const max = Math.max(...arr.map(fn).filter((item) => !isNaN(item)));
  return arr.filter((item) => fn(item) === max);
}

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
