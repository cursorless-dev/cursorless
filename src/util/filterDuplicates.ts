import { isEqual } from "lodash";

export function filterDuplicates<T>(elements: T[]) {
  return elements.filter(
    (element, index, elements) =>
      elements.findIndex((e) => isEqual(e, element)) === index
  );
}
