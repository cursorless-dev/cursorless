import { SelectionType } from "../typings/Types";

export function isLineSelectionType(selectionType: SelectionType) {
  return selectionType === "line" || selectionType === "paragraph";
}
