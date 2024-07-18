export class OutOfRangeError extends Error {
  constructor() {
    super("Scope index out of range");
    this.name = "OutOfRangeError";
  }
}

/** Slice list of by given indices */
export function sliceStrict<T>(
  targets: T[],
  startIndex: number,
  endIndex: number,
): T[] {
  assertIndices(targets, startIndex, endIndex);

  return targets.slice(startIndex, endIndex + 1);
}

export function assertIndices<T>(
  targets: T[],
  startIndex: number,
  endIndex: number,
): void {
  if (startIndex < 0 || endIndex >= targets.length) {
    throw new OutOfRangeError();
  }
}
