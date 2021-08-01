import { TypedSelection } from "./Types";

/** Get text from selection. Possibly add delimiter for positions before/after */
export function getTextWithPossibleDelimiter(
  source: TypedSelection,
  destination: TypedSelection
) {
  const sourceText = source.selection.editor.document.getText(
    source.selection.selection
  );
  return maybeAddDelimiter(sourceText, destination);
}

/** Possibly add delimiter for positions before/after */
export function maybeAddDelimiter(
  sourceText: string,
  destination: TypedSelection
) {
  const { insideOutsideType, position } = destination;
  const containingListDelimiter =
    destination.selectionContext.containingListDelimiter;
  return containingListDelimiter == null ||
    position === "contents" ||
    insideOutsideType === "inside"
    ? sourceText
    : destination.position === "after"
    ? containingListDelimiter + sourceText
    : sourceText + containingListDelimiter;
}
