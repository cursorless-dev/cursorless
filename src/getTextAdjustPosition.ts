import { TypedSelection } from "./Types";

export function getTextAdjustPosition(
  source: TypedSelection,
  destination: TypedSelection
) {
  const sourceText = source.selection.editor.document.getText(
    source.selection.selection
  );
  return forTextAdjustPosition(sourceText, destination);
}

export function forTextAdjustPosition(
  sourceText: string,
  destination: TypedSelection
) {
  const { insideOutsideType, position } = destination;
  const containingListDelimiter =
    destination.selectionContext.containingListDelimiter ?? " ";
  return position === "contents" || insideOutsideType === "inside"
    ? sourceText
    : destination.position === "after"
    ? containingListDelimiter + sourceText
    : sourceText + containingListDelimiter;
}
