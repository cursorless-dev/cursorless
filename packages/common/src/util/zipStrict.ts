export function zipStrict<T1, T2>(list1: T1[], list2: T2[]): [T1, T2][] {
  if (list1.length !== list2.length) {
    throw new Error("Lists must have the same length");
  }

  return list1.map((value, index) => [value, list2[index]]);
}
