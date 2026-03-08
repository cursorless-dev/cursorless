import type { ScopeType } from "@cursorless/common";

export class OutOfRangeError extends Error {
  constructor(scopeType: ScopeType, index?: number) {
    const numberStr = index != null ? ` #${index + 1}` : "";
    super(`Scope '${scopeType.type}'${numberStr} is out of range`);
    this.name = "OutOfRangeError";
  }
}

/** Slice list of by given indices */
export function sliceStrict<T>(
  scopeType: ScopeType,
  targets: T[],
  startIndex: number,
  endIndex: number,
): T[] {
  assertIndices(scopeType, targets, startIndex, endIndex);

  return targets.slice(startIndex, endIndex + 1);
}

export function assertIndices<T>(
  scopeType: ScopeType,
  targets: T[],
  startIndex: number,
  endIndex: number,
): void {
  if (startIndex < 0 || startIndex >= targets.length) {
    throw new OutOfRangeError(scopeType, startIndex);
  }
  if (endIndex < 0 || endIndex >= targets.length) {
    throw new OutOfRangeError(scopeType, endIndex);
  }
}
