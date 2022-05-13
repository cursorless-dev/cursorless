import { Selection } from "vscode";
import {
  ProcessedTargetsContext,
  TypedSelection,
} from "../typings/Types";
import { PrimitiveTarget } from "../typings/target.types";

export default function (
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: TypedSelection
): TypedSelection {
  const { position } = target;
  const originalSelection = selection.selection.selection;
  let newSelection;

  switch (position) {
    case "contents":
      newSelection = originalSelection;
      break;

    case "before":
      newSelection = new Selection(
        originalSelection.start,
        originalSelection.start
      );
      break;

    case "after":
      newSelection = new Selection(
        originalSelection.end,
        originalSelection.end
      );
      break;
  }

  return {
    selection: {
      selection: newSelection,
      editor: selection.selection.editor,
    },
    selectionType: selection.selectionType,
    selectionContext: selection.selectionContext,
    insideOutsideType: target.insideOutsideType ?? null,
    position,
  };
}
