import type { Selection } from "../types/Selection";

export function selectionsEqual(a: Selection[], b: Selection[]): boolean {
  return (
    a.length === b.length && a.every((selection, i) => selection.isEqual(b[i]))
  );
}
