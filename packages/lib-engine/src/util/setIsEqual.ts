export function setIsEqual<T>(a: Set<T> | undefined, b: Set<T> | undefined) {
  if (a == null || b == null) {
    return a === b;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}
