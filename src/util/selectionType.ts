import { SelectionType } from "../typings/target.types";

export function isLineSelectionType(selectionType: SelectionType) {
  return selectionType === "line" || selectionType === "paragraph";
}
