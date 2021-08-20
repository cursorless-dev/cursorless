import { ActionType, PartialTarget, SelectionType } from "./typings/Types";
import { getPrimitiveTargets } from "./util/targetUtils";

export function checkCommandValidity(
  actionName: ActionType,
  partialTargets: PartialTarget[],
  extraArgs: any[]
) {
  if (
    usesSelectionType("notebookCell", partialTargets) &&
    !["editNewLineAbove", "editNewLineBelow"].includes(actionName)
  ) {
    throw new Error(
      "The notebookCell scope type is currently only supported with the actions editNewLineAbove and editNewLineBelow"
    );
  }
}

function usesSelectionType(
  selectionType: SelectionType,
  partialTargets: PartialTarget[]
) {
  return getPrimitiveTargets(partialTargets).some(
    (partialTarget) => partialTarget.selectionType === selectionType
  );
}
