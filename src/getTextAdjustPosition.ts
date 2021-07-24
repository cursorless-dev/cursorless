import { TypedSelection } from "./Types";

export default function getTextAdjustPosition(
  source: TypedSelection,
  destination: TypedSelection
) {
  const sourceText = source.selection.editor.document.getText(
    source.selection.selection
  );
  const { insideOutsideType, position } = destination;
  const { containingListDelimiter } = destination.selectionContext;
  return containingListDelimiter == null ||
    position === "contents" ||
    insideOutsideType === "inside"
    ? sourceText
    : destination.position === "after"
    ? containingListDelimiter + sourceText
    : sourceText + containingListDelimiter;
}
